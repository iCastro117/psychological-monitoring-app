package com.usar.monitoreo.controller;

import com.usar.monitoreo.entity.Encuesta;
import com.usar.monitoreo.entity.Rescatista;
import com.usar.monitoreo.repository.EncuestaRepository;
import com.usar.monitoreo.repository.RescatistaRepository;
import com.usar.monitoreo.service.EncuestaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// Recibe lo que manda el formulario de index.html (app.js) y lo guarda en la base de datos.
// También sirve las páginas (/, /dashboard, /perfil, /login) y la API que consumen
// dashboard.js y perfil.js. Guardar y calcular el riesgo lo hace EncuestaService.
@Controller
@RequestMapping("/")
public class WebController {

    @Autowired private EncuestaService encuestaService;
    @Autowired private EncuestaRepository encuestaRepository;
    @Autowired private RescatistaRepository rescatistaRepository;

    // ─── Páginas HTML ──────────────────────────────────────────────────────────

    @GetMapping
    public String index() { return "forward:/index.html"; }

    @GetMapping("/dashboard")
    public String dashboard() { return "forward:/dashboard.html"; }

    @GetMapping("/perfil")
    public String perfil() { return "forward:/perfil.html"; }

    @GetMapping("/login")
    public String login() { return "forward:/login.html"; }

    // ─── API REST ──────────────────────────────────────────────────────────────

    /** Verifica si una cédula ya está registrada en el sistema */
    // Lo llama app.js mientras el usuario escribe la cédula, para avisarle en el momento.
    @GetMapping("/api/cedula-existe/{cedula}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cedulaExiste(@PathVariable String cedula) {
        boolean existe = rescatistaRepository.findByCedula(cedula).isPresent();
        Map<String, Object> r = new HashMap<>();
        r.put("existe", existe);
        return ResponseEntity.ok(r);
    }

    /** Recibe y guarda una encuesta */
    // Aquí llega el envío de app.js: revisa los datos, crea al rescatista si no existe y guarda.
    @PostMapping("/api/enviar-encuesta")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> enviarEncuesta(@RequestBody Map<String, Object> datos) {
        try {
            String nombreCompleto = (String) datos.get("nombreCompleto");
            String cedula         = (String) datos.get("cedula");

            @SuppressWarnings("unchecked")
            List<Integer> respuestasLista = (List<Integer>) datos.get("respuestas");

            if (nombreCompleto == null || nombreCompleto.isBlank())
                return errorResponse("El nombre completo es obligatorio.");
            if (cedula == null || cedula.isBlank())
                return errorResponse("La cédula es obligatoria.");
            if (respuestasLista == null || respuestasLista.size() != 23)
                return errorResponse("Debe responder las 23 preguntas.");

            // Bloquear si la cédula ya existe
            if (rescatistaRepository.findByCedula(cedula).isPresent())
                return errorResponse("Esta cédula ya fue registrada anteriormente.");

            int[] respuestas = new int[23];
            for (int i = 0; i < 23; i++) {
                respuestas[i] = respuestasLista.get(i) != null ? respuestasLista.get(i) : 0;
            }

            Optional<Rescatista> rescatista =
                    encuestaService.obtenerOCrearRescatista(nombreCompleto, cedula);

            if (rescatista.isPresent()) {
                Encuesta encuesta = encuestaService.guardarEncuesta(rescatista.get(), respuestas);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("mensaje", "Encuesta guardada exitosamente");
                response.put("idEncuesta", encuesta.getIdEncuesta());
                return ResponseEntity.ok(response);
            } else {
                return errorResponse("Error al registrar el rescatista.");
            }
        } catch (Exception e) {
            return errorResponse("Error interno: " + e.getMessage());
        }
    }

    /** Lista todas las encuestas */
    // dashboard.js la pide al cargar para llenar la tabla.
    @GetMapping("/api/encuestas")
    @ResponseBody
    public ResponseEntity<List<Encuesta>> obtenerEncuestas() {
        return ResponseEntity.ok(encuestaService.obtenerTodasLasEncuestas());
    }

    /** Detalle de una encuesta — ahora devuelve respuesta1-23 gracias a @JsonAutoDetect */
    // perfil.js la pide al abrir una encuesta para mostrar las 23 respuestas.
    @GetMapping("/api/encuestas/{id}")
    @ResponseBody
    public ResponseEntity<Encuesta> obtenerEncuesta(@PathVariable Long id) {
        return encuestaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Elimina una encuesta */
    // Botón de borrar del dashboard.
    @DeleteMapping("/api/encuestas/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarEncuesta(@PathVariable Long id) {
        try {
            Optional<Encuesta> encuesta = encuestaRepository.findById(id);
            if (encuesta.isEmpty())
                return errorResponse("Encuesta no encontrada.");

            Long idRescatista = encuesta.get().getRescatista().getId();
            encuestaRepository.deleteById(id);

            // Los datos viven en dos tablas: si la persona se queda sin encuestas y
            // no se borra también, su cédula queda bloqueada para siempre aunque en
            // el dashboard ya no aparezca nada.
            if (encuestaRepository.findByRescatistaId(idRescatista).isEmpty())
                rescatistaRepository.deleteById(idRescatista);
            Map<String, Object> r = new HashMap<>();
            r.put("success", true);
            r.put("mensaje", "Encuesta eliminada exitosamente");
            return ResponseEntity.ok(r);
        } catch (Exception e) {
            return errorResponse("Error al eliminar: " + e.getMessage());
        }
    }

    /** Edita nombre y cédula del rescatista */
    // dashboard.js la usa al editar los datos de la persona desde el detalle.
    @PutMapping("/api/rescatistas/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarRescatista(
            @PathVariable Long id,
            @RequestBody Map<String, Object> datos) {
        try {
            Optional<Rescatista> opt = rescatistaRepository.findById(id);
            if (opt.isEmpty()) return errorResponse("Rescatista no encontrado.");

            Rescatista r = opt.get();
            String nuevoNombre = (String) datos.get("nombreCompleto");
            String nuevaCedula = (String) datos.get("cedula");

            if (nuevoNombre != null && !nuevoNombre.isBlank()) r.setNombreCompleto(nuevoNombre);
            if (nuevaCedula != null && !nuevaCedula.isBlank()) r.setCedula(nuevaCedula);

            rescatistaRepository.save(r);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Datos actualizados correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Error al actualizar: " + e.getMessage());
        }
    }

    /** Alertas de riesgo alto */
    // Devuelve solo las encuestas de nivel 3 o más; queda lista, hoy ningún js la llama.
    @GetMapping("/api/alertas")
    @ResponseBody
    public ResponseEntity<List<Encuesta>> obtenerAlertas() {
        return ResponseEntity.ok(encuestaService.obtenerAlertasRiesgo());
    }

    private ResponseEntity<Map<String, Object>> errorResponse(String mensaje) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false);
        r.put("mensaje", mensaje);
        return ResponseEntity.status(500).body(r);
    }
}
