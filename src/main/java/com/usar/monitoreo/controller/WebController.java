package com.usar.monitoreo.controller;

import com.usar.monitoreo.entity.Encuesta;
import com.usar.monitoreo.entity.Rescatista;
import com.usar.monitoreo.service.EncuestaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/")
public class WebController {
    @Autowired
    private EncuestaService encuestaService;

    @GetMapping
    public String index() {
        return "forward:/index.html";
    }

    @PostMapping("/api/enviar-encuesta")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> enviarEncuesta(@RequestBody Map<String, Object> datos) {
        try {
            String nombreCodigo = (String) datos.get("nombreCodigo");
            String rango = (String) datos.get("rango");
            String unidad = (String) datos.get("unidad");
            
            @SuppressWarnings("unchecked")
            java.util.List<Integer> respuestasLista = (java.util.List<Integer>) datos.get("respuestas");
            
            int[] respuestas = new int[respuestasLista.size()];
            for (int i = 0; i < respuestasLista.size(); i++) {
                respuestas[i] = respuestasLista.get(i);
            }

            Optional<Rescatista> rescatista = encuestaService.obtenerOCrearRescatista(nombreCodigo, rango, unidad);
            
            if (rescatista.isPresent()) {
                Encuesta encuesta = encuestaService.guardarEncuesta(rescatista.get(), respuestas);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("mensaje", "Encuesta guardada exitosamente");
                response.put("idEncuesta", encuesta.getIdEncuesta());
                response.put("nivelRiesgo", encuesta.getNivelRiesgo());
                response.put("etiquetaRiesgo", encuestaService.obtenerEtiquetaRiesgo(encuesta.getNivelRiesgo()));
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("mensaje", "Error al crear rescatista");
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("mensaje", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/api/encuestas")
    @ResponseBody
    public ResponseEntity<List<Encuesta>> obtenerEncuestas() {
        return ResponseEntity.ok(encuestaService.obtenerTodasLasEncuestas());
    }

    @GetMapping("/api/alertas")
    @ResponseBody
    public ResponseEntity<List<Encuesta>> obtenerAlertas() {
        return ResponseEntity.ok(encuestaService.obtenerAlertasRiesgo());
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        List<Encuesta> encuestas = encuestaService.obtenerTodasLasEncuestas();
        model.addAttribute("encuestas", encuestas);
        return "forward:/dashboard.html";
    }
}
