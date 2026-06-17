package com.usar.monitoreo.service;

import com.usar.monitoreo.entity.Encuesta;
import com.usar.monitoreo.entity.Rescatista;
import com.usar.monitoreo.repository.EncuestaRepository;
import com.usar.monitoreo.repository.RescatistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EncuestaService {
    @Autowired
    private EncuestaRepository encuestaRepository;
    
    @Autowired
    private RescatistaRepository rescatistaRepository;

    public Encuesta guardarEncuesta(Rescatista rescatista, int[] respuestas) {
        Encuesta encuesta = new Encuesta();
        encuesta.setRescatista(rescatista);
        
        for (int i = 0; i < respuestas.length; i++) {
            encuesta.setRespuesta(i + 1, respuestas[i]);
        }
        
        encuesta.setNivelRiesgo(calcularNivelRiesgo(respuestas));
        return encuestaRepository.save(encuesta);
    }

    public int calcularNivelRiesgo(int[] respuestas) {
        // Preguntas críticas: 1 (agotamiento), 2 (pensamientos recurrentes), 
        // 3 (dificultades para dormir), 8 (impacto emocional), 13 (irritabilidad)
        int[] preguntasCriticas = {0, 1, 2, 7, 12}; // índices: 1, 2, 3, 8, 13
        int suma = 0;
        
        for (int idx : preguntasCriticas) {
            if (idx < respuestas.length) {
                suma += respuestas[idx];
            }
        }
        
        // Escala de riesgo
        if (suma >= 20) return 5; // Crítico
        if (suma >= 16) return 4; // Alto
        if (suma >= 12) return 3; // Medio
        if (suma >= 8) return 2;  // Bajo
        return 1; // Mínimo
    }

    public List<Encuesta> obtenerTodasLasEncuestas() {
        return encuestaRepository.findAll();
    }

    public List<Encuesta> obtenerAlertasRiesgo() {
        return encuestaRepository.findAlertasRiesgo();
    }

    public List<Encuesta> obtenerEncuestasPorRescatista(Long rescatistaId) {
        return encuestaRepository.findByRescatistaId(rescatistaId);
    }

    public Optional<Rescatista> obtenerOCrearRescatista(String nombreCodigo, String rango, String unidad) {
        Optional<Rescatista> existente = rescatistaRepository.findByNombreCodigo(nombreCodigo);
        if (existente.isPresent()) {
            return existente;
        } else {
            Rescatista nuevo = new Rescatista(nombreCodigo, rango, unidad);
            return Optional.of(rescatistaRepository.save(nuevo));
        }
    }

    public String obtenerColorRiesgo(Integer nivel) {
        if (nivel == null) return "gray";
        switch(nivel) {
            case 5: return "red";
            case 4: return "orange";
            case 3: return "yellow";
            case 2: return "blue";
            default: return "green";
        }
    }

    public String obtenerEtiquetaRiesgo(Integer nivel) {
        if (nivel == null) return "Desconocido";
        switch(nivel) {
            case 5: return "CRÍTICO";
            case 4: return "ALTO";
            case 3: return "MEDIO";
            case 2: return "BAJO";
            default: return "MÍNIMO";
        }
    }
}
