package com.usar.monitoreo.entity;

import jakarta.persistence.*;

// La persona que responde: nombre, cédula y cuándo se registró. Una fila por rescatista.
// EncuestaService la crea al llegar el formulario y cada Encuesta apunta a ella.
@Entity
@Table(name = "rescatistas")
public class Rescatista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @Column(name = "cedula", nullable = false)
    private String cedula;

    @Column(name = "fecha_registro", nullable = false)
    private Long fechaRegistro;

    public Rescatista() {}

    public Rescatista(String nombreCompleto, String cedula) {
        this.nombreCompleto = nombreCompleto;
        this.cedula = cedula;
        this.fechaRegistro = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }

    public Long getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(Long fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
