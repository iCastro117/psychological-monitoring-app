package com.usar.monitoreo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
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
 * 1. POST /api/auth/solicitar-codigo → valida email, genera OTP 4 dígitos,
 * envía vía Brevo
 * 2. POST /api/auth/verificar-codigo → valida OTP, devuelve token de sesión
 * 3. GET /api/auth/verificar-sesion → valida token activo
 * 4. POST /api/auth/cerrar-sesion → invalida el token
 *
 * El token de sesión va firmado con HMAC-SHA256 y lleva dentro su propia
 * fecha de vencimiento, de modo que el servidor lo valida sin guardar nada
 * en memoria: un reinicio de la instancia (frecuente en el plan gratuito de
 * Render) ya no cierra las sesiones abiertas.
 */
// Lo consumen login.js (pedir el código y verificarlo) y auth-guard.js (revisar la sesión
// al abrir dashboard.html y perfil.html, y cerrarla).
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // Lista fija de correos que pueden entrar al dashboard; cualquier otro se rechaza.
    private static final Set<String> EMAILS_AUTORIZADOS = Set.of(
            "castrocjuanpablo@gmail.com",
            "anyiliz2010@gmail.com",
            "isabellacastrocamacho117@gmail.com");

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    /** Duración exacta de la sesión: 2 horas desde el momento del login. */
    private static final long DURACION_SESION_MS = 2 * 60 * 60_000L;

    // Códigos pendientes en memoria (correo → código); se borran al usarlos o al vencer.
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    /** Tokens cerrados manualmente antes de su vencimiento (token → expiración). */
    private final Map<String, Long> tokensRevocados = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String remitente;

    @Value("${app.session.secret}")
    private String claveFirma;

    // ─── Paso 1: solicitar código ─────────────────────────────────────────────

    // login.js manda el correo; aquí se genera el código de 4 dígitos y se envía por Brevo.
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
            r.put("mensaje", String.valueOf(e.getMessage()).contains("unrecognised IP address")
                    ? "Brevo está bloqueando la IP del servidor. Autorícela en "
                            + "https://app.brevo.com/security/authorised_ips"
                    : "No se pudo enviar el código. Verifique la configuración de Brevo.");
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
                        "— Sistema USAR COL-13");

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

    // login.js manda correo y código; si coinciden devuelve el token que guarda el navegador.
    @PostMapping("/verificar-codigo")
    public ResponseEntity<Map<String, Object>> verificarCodigo(
            @RequestBody Map<String, Object> datos) {

        String email = normalizar((String) datos.get("email"));
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

        long expiracion = System.currentTimeMillis() + DURACION_SESION_MS;
        String token = firmarToken(email, expiracion);

        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("token", token);
        r.put("email", email);
        r.put("expiraEn", expiracion);
        return ResponseEntity.ok(r);
    }

    // ─── Verificar sesión activa ──────────────────────────────────────────────

    // auth-guard.js lo consulta al abrir cada página protegida para dejar pasar o mandar al login.
    @GetMapping("/verificar-sesion")
    public ResponseEntity<Map<String, Object>> verificarSesion(
            @RequestParam String token) {

        SessionEntry session = validarToken(token);
        Map<String, Object> r = new HashMap<>();

        if (session == null) {
            r.put("valido", false);
        } else {
            r.put("valido", true);
            r.put("email", session.email);
            r.put("expiraEn", session.expiracion);
        }

        return ResponseEntity.ok(r);
    }

    // ─── Cerrar sesión ────────────────────────────────────────────────────────

    // Botón de salir de auth-guard.js: el token se marca como revocado hasta que venza solo.
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<Map<String, Object>> cerrarSesion(
            @RequestBody Map<String, Object> datos) {

        String token = (String) datos.get("token");
        if (token != null) {
            SessionEntry session = validarToken(token);
            if (session != null)
                tokensRevocados.put(token, session.expiracion);
        }

        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        return ResponseEntity.ok(r);
    }

    // ─── Token de sesión firmado ──────────────────────────────────────────────

    /**
     * Construye un token con el formato {@code base64(email|expiracion).base64(firma)}.
     * Como la expiración viaja dentro del token y la firma impide manipularla,
     * el servidor puede validarlo sin recordar nada entre reinicios.
     */
    private String firmarToken(String email, long expiracion) {
        String contenido = codificar((email + "|" + expiracion).getBytes(StandardCharsets.UTF_8));
        return contenido + "." + codificar(calcularFirma(contenido));
    }

    /** Devuelve la sesión si el token es auténtico y no ha vencido; si no, null. */
    private SessionEntry validarToken(String token) {
        if (token == null)
            return null;

        int separador = token.lastIndexOf('.');
        if (separador < 1)
            return null;

        String contenido = token.substring(0, separador);
        byte[] firmaRecibida;
        byte[] datos;
        try {
            firmaRecibida = Base64.getUrlDecoder().decode(token.substring(separador + 1));
            datos = Base64.getUrlDecoder().decode(contenido);
        } catch (IllegalArgumentException e) {
            return null;
        }

        if (!MessageDigest.isEqual(calcularFirma(contenido), firmaRecibida))
            return null;

        String[] partes = new String(datos, StandardCharsets.UTF_8).split("\\|");
        if (partes.length != 2)
            return null;

        long expiracion;
        try {
            expiracion = Long.parseLong(partes[1]);
        } catch (NumberFormatException e) {
            return null;
        }

        if (System.currentTimeMillis() > expiracion) {
            tokensRevocados.remove(token);
            return null;
        }

        tokensRevocados.values().removeIf(exp -> System.currentTimeMillis() > exp);
        if (tokensRevocados.containsKey(token))
            return null;

        return new SessionEntry(partes[0], expiracion);
    }

    private byte[] calcularFirma(String contenido) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(claveFirma.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(contenido.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo firmar el token de sesión", e);
        }
    }

    private String codificar(byte[] datos) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(datos);
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
        final long expiracion;

        OtpEntry(String codigo, long expiracion) {
            this.codigo = codigo;
            this.expiracion = expiracion;
        }
    }

    private static class SessionEntry {
        final String email;
        final long expiracion;

        SessionEntry(String email, long expiracion) {
            this.email = email;
            this.expiracion = expiracion;
        }
    }
}
