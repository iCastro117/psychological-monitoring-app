package com.usar.monitoreo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controlador de autenticación para el dashboard.
 *
 * ⚠️ IMPORTANTE: Render bloquea los puertos SMTP (25, 465, 587) en el
 * plan gratuito desde septiembre 2025. Por eso este controlador NO usa
 * JavaMailSender/SMTP — en su lugar envía el correo a través de la API
 * HTTP de Brevo (https://www.brevo.com), que viaja por el puerto 443
 * (HTTPS), el cual nunca está bloqueado.
 *
 * Flujo:
 * 1. POST /api/auth/solicitar-codigo  → valida email, genera OTP 4 dígitos, envía vía Brevo
 * 2. POST /api/auth/verificar-codigo  → valida OTP, devuelve token de sesión
 * 3. GET  /api/auth/verificar-sesion  → valida token activo
 * 4. POST /api/auth/cerrar-sesion     → invalida el token
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private static final Set<String> EMAILS_AUTORIZADOS = Set.of(
        "castrocjuanpablo@gmail.com",
        "anyiliz2010@gmail.com",
        "isabellacastrocamacho117@gmail.com"
    );

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final Map<String, OtpEntry>     otpStorage     = new ConcurrentHashMap<>();
    private final Map<String, SessionEntry> sessionStorage = new ConcurrentHashMap<>();

    private final HttpClient   httpClient   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Configura estas 2 variables en Render → Environment
    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String remitente;

    // ─── Paso 1: solicitar código ─────────────────────────────────────────────

    @PostMapping("/solicitar-codigo")
    public ResponseEntity<Map<String, Object>> solicitarCodigo(
            @RequestBody Map<String, Object> datos) {

        String email = normalizar((String) datos.get("email"));
        log.info("Solicitud de código para: {}", email);

        if (!EMAILS_AUTORIZADOS.contains(email)) {
            log.warn("Intento de acceso con correo NO autorizado: {}", email);
            return error("Correo no autorizado para acceder al sistema.");
        }

        String codigo = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(email, new OtpEntry(codigo, System.currentTimeMillis() + 5 * 60_000L));

        try {
            enviarCorreoViaBrevo(email, codigo);
            log.info("✅ Correo enviado exitosamente a {} vía Brevo", email);
        } catch (Exception e) {
            log.error("❌ ERROR AL ENVIAR CORREO (Brevo) a {} — Causa: {}", email, e.toString(), e);
            otpStorage.remove(email);

            Map<String, Object> r = new HashMap<>();
            r.put("success", false);
            r.put("mensaje", "No se pudo enviar el código. Verifique la configuración de Brevo en Render.");
            r.put("errorTecnico", e.getClass().getSimpleName() + ": " + e.getMessage());
            return ResponseEntity.status(400).body(r);
        }

        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("mensaje", "Código enviado. Revise su bandeja de entrada.");
        return ResponseEntity.ok(r);
    }

    /**
     * Envía el correo usando la API REST de Brevo (HTTPS, puerto 443).
     * Documentación: https://developers.brevo.com/reference/sendtransacemail
     */
    private void enviarCorreoViaBrevo(String destinatario, String codigo) throws Exception {

        Map<String, Object> sender = new HashMap<>();
        sender.put("name", "USAR COL-13");
        sender.put("email", remitente);

        Map<String, Object> to = new HashMap<>();
        to.put("email", destinatario);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", sender);
        body.put("to", List.of(to));
        body.put("subject", "USAR COL-13 — Código de acceso al Dashboard");
        body.put("textContent",
            "Hola,\n\n" +
            "Su código de acceso al Panel de Monitoreo Psicológico es:\n\n" +
            "        " + codigo + "\n\n" +
            "Este código es válido por 5 minutos.\n" +
            "Si no solicitó este acceso, puede ignorar este mensaje.\n\n" +
            "— Sistema USAR COL-13"
        );

        String jsonBody = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_API_URL))
                .header("accept", "application/json")
                .header("api-key", brevoApiKey)
                .header("content-type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        log.info("Respuesta Brevo — status: {}, body: {}", response.statusCode(), response.body());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException(
                "Brevo respondió con error " + response.statusCode() + ": " + response.body());
        }
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

    // ─── Verificar sesión activa ──────────────────────────────────────────────

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

    // ─── Almacenamiento en memoria ─────────────────────────────────────────────

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
