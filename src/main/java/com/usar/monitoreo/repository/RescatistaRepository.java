package com.usar.monitoreo.repository;

import com.usar.monitoreo.entity.Rescatista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RescatistaRepository extends JpaRepository<Rescatista, Long> {
    Optional<Rescatista> findByCedula(String cedula);
}
