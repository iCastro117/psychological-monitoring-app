package com.usar.monitoreo.repository;

import com.usar.monitoreo.entity.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

// Acceso a la tabla encuestas (las 23 respuestas de cada formulario).
// Lo usan EncuestaService y WebController.
@Repository
public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {
    // Las encuestas de una persona; WebController lo usa al borrar.
    List<Encuesta> findByRescatistaId(Long rescatistaId);
    
    // Solo las de nivel 3 o más, de la más reciente a la más vieja.
    @Query("SELECT e FROM Encuesta e WHERE e.nivelRiesgo >= 3 ORDER BY e.fechaHora DESC")
    List<Encuesta> findAlertasRiesgo();
}
