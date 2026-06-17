package com.usar.monitoreo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rescatistas")
public class Rescatista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreCodigo;

    @Column(nullable = false)
    private String rango;

    @Column(nullable = false)
    private String unidad;

    @Column(nullable = false)
    private Long fechaRegistro;

    public Rescatista() {}

    public Rescatista(String nombreCodigo, String rango, String unidad) {
        this.nombreCodigo = nombreCodigo;
        this.rango = rango;
        this.unidad = unidad;
        this.fechaRegistro = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombreCodigo() { return nombreCodigo; }
    public void setNombreCodigo(String nombreCodigo) { this.nombreCodigo = nombreCodigo; }
    public String getRango() { return rango; }
    public void setRango(String rango) { this.rango = rango; }
    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public Long getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(Long fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
