package com.usar.monitoreo.repository;

import com.usar.monitoreo.entity.Rescatista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Acceso a la tabla rescatistas (la persona: nombre y cédula).
// Lo usan EncuestaService y WebController.
@Repository
public interface RescatistaRepository extends JpaRepository<Rescatista, Long> {
    // Sirve para saber si una cédula ya está registrada antes de crear a la persona.
    Optional<Rescatista> findByCedula(String cedula);
}
