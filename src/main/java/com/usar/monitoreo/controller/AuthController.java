package com.usar.monitoreo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controlador de autenticación para el dashboard.
 *
 * Flujo:
 * 1. POST /api/auth/solicitar-codigo  → valida email, genera OTP 4 dígitos, envía al correo
 * 2. POST /api/auth/verificar-codigo  → valida OTP, devuelve token de sesión
 * 3. GET  /api/auth/verificar-sesion  → valida token activo
 * 4. POST /api/auth/cerrar-sesion     → invalida el token
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // ─── Correos autorizados para acceder al dashboard ────────────────────────
    private static final Set<String> EMAILS_AUTORIZADOS = Set.of(
        "castrocjuanpablo@gmail.com",
        "anyiliz2010@gmail.com",
        "isabellacastrocamacho117@gmail.com"
    );

    // OTP en memoria: email → {codigo, expiracion}
    private final Map<String, OtpEntry>     otpStorage     = new ConcurrentHashMap<>();
    // Sesiones activas: token → {email, expiracion}
    private final Map<String, SessionEntry> sessionStorage = new ConcurrentHashMap<>();

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    // ─── Paso 1: solicitar código ─────────────────────────────────────────────

    @PostMapping("/solicitar-codigo")
    public ResponseEntity<Map<String, Object>> solicitarCodigo(
            @RequestBody Map<String, Object> datos) {

        String email = normalizar((String) datos.get("email"));

        if (!EMAILS_AUTORIZADOS.contains(email)) {
            // No revelar si el email existe o no en la lista
            return error("Correo no autorizado para acceder al sistema.");
        }

        // Generar OTP de 4 dígitos con ceros a la izquierda
        String codigo = String.format("%04d", new Random().nextInt(10000));

        // Guardar con expiración de 5 minutos
        otpStorage.put(email, new OtpEntry(codigo, System.currentTimeMillis() + 5 * 60_000L));

        // Enviar correo
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(remitente);
            msg.setTo(email);
            msg.setSubject("USAR COL-13 — Código de acceso al Dashboard");
            msg.setText(
                "Hola,\n\n" +
                "Su código de acceso al Panel de Monitoreo Psicológico es:\n\n" +
                "        " + codigo + "\n\n" +
                "Este código es válido por 5 minutos.\n" +
                "Si no solicitó este acceso, puede ignorar este mensaje.\n\n" +
                "— Sistema USAR COL-13"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            otpStorage.remove(email);
            return error("No se pudo enviar el código. Verifique la configuración de correo en Render.");
        }

        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("mensaje", "Código enviado. Revise su bandeja de entrada.");
        return ResponseEntity.ok(r);
    }

    // ─── Paso 2: verificar código → devuelve token de sesión ─────────────────

    @PostMapping("/verificar-codigo")
    public ResponseEntity<Map<String, Object>> verificarCodigo(
            @RequestBody Map<String, Object> datos) {

        String email  = normalizar((String) datos.get("email"));
        String codigo = ((String) datos.get("codigo")).trim();

        OtpEntry otp = otpStorage.get(email);

        if (otp == null) {
            return error("No hay un código pendiente para este correo. Solicite uno nuevo.");
        }
        if (System.currentTimeMillis() > otp.expiracion) {
            otpStorage.remove(email);
            return error("El código ha expirado. Solicite uno nuevo.");
        }
        if (!otp.codigo.equals(codigo)) {
            return error("Código incorrecto. Verifique e intente de nuevo.");
        }

        // ✅ Código correcto — generar token de sesión (válido 8 horas)
        otpStorage.remove(email);
        String token = UUID.randomUUID().toString();
        sessionStorage.put(token,
            new SessionEntry(email, System.currentTimeMillis() + 8 * 60 * 60_000L));

        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("token", token);
        r.put("email", email);
        return ResponseEntity.ok(r);
    }

    // ─── Verificar sesión activa (llamada en cada carga del dashboard) ────────

    @GetMapping("/verificar-sesion")
    public ResponseEntity<Map<String, Object>> verificarSesion(
            @RequestParam String token) {

        SessionEntry session = sessionStorage.get(token);
        Map<String, Object> r = new HashMap<>();

        if (session == null || System.currentTimeMillis() > session.expiracion) {
            sessionStorage.remove(token);
            r.put("valido", false);
        } else {
            r.put("valido", true);
            r.put("email", session.email);
        }

        return ResponseEntity.ok(r);
    }

    // ─── Cerrar sesión ────────────────────────────────────────────────────────

    @PostMapping("/cerrar-sesion")
    public ResponseEntity<Map<String, Object>> cerrarSesion(
            @RequestBody Map<String, Object> datos) {

        String token = (String) datos.get("token");
        if (token != null) sessionStorage.remove(token);

        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        return ResponseEntity.ok(r);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String normalizar(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private ResponseEntity<Map<String, Object>> error(String msg) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false);
        r.put("mensaje", msg);
        return ResponseEntity.status(400).body(r);
    }

    // ─── Clases internas de almacenamiento en memoria ─────────────────────────

    private static class OtpEntry {
        final String codigo;
        final long   expiracion;
        OtpEntry(String codigo, long expiracion) {
            this.codigo    = codigo;
            this.expiracion = expiracion;
        }
    }

    private static class SessionEntry {
        final String email;
        final long   expiracion;
        SessionEntry(String email, long expiracion) {
            this.email      = email;
            this.expiracion = expiracion;
        }
    }
}
