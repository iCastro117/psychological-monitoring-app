package com.usar.monitoreo.repository;

import com.usar.monitoreo.entity.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {
    List<Encuesta> findByRescatistaId(Long rescatistaId);
    
    @Query("SELECT e FROM Encuesta e WHERE e.nivelRiesgo >= 3 ORDER BY e.fechaHora DESC")
    List<Encuesta> findAlertasRiesgo();
}
