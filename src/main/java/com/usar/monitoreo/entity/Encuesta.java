package com.usar.monitoreo.entity;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import jakarta.persistence.*;

// Una fila por formulario enviado: las 23 respuestas, el nivel de riesgo ya calculado
// y a qué rescatista pertenece. La llena EncuestaService y la leen dashboard.js y perfil.js.

/**
 * Fix crítico: @JsonAutoDetect(fieldVisibility = ANY) le dice a Jackson
 * que serialice todos los campos privados directamente, incluyendo
 * respuesta1 a respuesta23 que no tienen getters individuales.
 * Sin esto, el perfil recibe un objeto vacío.
 */
@Entity
@Table(name = "encuestas")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Encuesta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEncuesta;

    @ManyToOne
    @JoinColumn(name = "id_rescatista", nullable = false)
    private Rescatista rescatista;

    @Column(nullable = false)
    private Long fechaHora;

    @Column(nullable = false) private Integer respuesta1;
    @Column(nullable = false) private Integer respuesta2;
    @Column(nullable = false) private Integer respuesta3;
    @Column(nullable = false) private Integer respuesta4;
    @Column(nullable = false) private Integer respuesta5;
    @Column(nullable = false) private Integer respuesta6;
    @Column(nullable = false) private Integer respuesta7;
    @Column(nullable = false) private Integer respuesta8;
    @Column(nullable = false) private Integer respuesta9;
    @Column(nullable = false) private Integer respuesta10;
    @Column(nullable = false) private Integer respuesta11;
    @Column(nullable = false) private Integer respuesta12;
    @Column(nullable = false) private Integer respuesta13;
    @Column(nullable = false) private Integer respuesta14;
    @Column(nullable = false) private Integer respuesta15;
    @Column(nullable = false) private Integer respuesta16;
    @Column(nullable = false) private Integer respuesta17;
    @Column(nullable = false) private Integer respuesta18;
    @Column(nullable = false) private Integer respuesta19;
    @Column(nullable = false) private Integer respuesta20;
    @Column(nullable = false) private Integer respuesta21;
    @Column(nullable = false) private Integer respuesta22;
    @Column(nullable = false) private Integer respuesta23;

    @Column(nullable = false)
    private Integer nivelRiesgo;

    @Column(length = 500)
    private String observaciones;

    // La fecha se pone sola al crear la encuesta; no viene del formulario.
    public Encuesta() {
        this.fechaHora = System.currentTimeMillis();
    }

    public Long getIdEncuesta()                     { return idEncuesta; }
    public void setIdEncuesta(Long v)               { this.idEncuesta = v; }
    public Rescatista getRescatista()               { return rescatista; }
    public void setRescatista(Rescatista r)         { this.rescatista = r; }
    public Long getFechaHora()                      { return fechaHora; }
    public void setFechaHora(Long v)                { this.fechaHora = v; }
    public Integer getNivelRiesgo()                 { return nivelRiesgo; }
    public void setNivelRiesgo(Integer v)           { this.nivelRiesgo = v; }
    public String getObservaciones()                { return observaciones; }
    public void setObservaciones(String v)          { this.observaciones = v; }

    // Las 23 respuestas son campos sueltos, así que se entra a ellas por número (1 a 23).
    public Integer getRespuesta(int numero) {
        switch (numero) {
            case 1:  return respuesta1;  case 2:  return respuesta2;
            case 3:  return respuesta3;  case 4:  return respuesta4;
            case 5:  return respuesta5;  case 6:  return respuesta6;
            case 7:  return respuesta7;  case 8:  return respuesta8;
            case 9:  return respuesta9;  case 10: return respuesta10;
            case 11: return respuesta11; case 12: return respuesta12;
            case 13: return respuesta13; case 14: return respuesta14;
            case 15: return respuesta15; case 16: return respuesta16;
            case 17: return respuesta17; case 18: return respuesta18;
            case 19: return respuesta19; case 20: return respuesta20;
            case 21: return respuesta21; case 22: return respuesta22;
            case 23: return respuesta23; default: return 0;
        }
    }

    public void setRespuesta(int numero, Integer valor) {
        switch (numero) {
            case 1:  respuesta1  = valor; break; case 2:  respuesta2  = valor; break;
            case 3:  respuesta3  = valor; break; case 4:  respuesta4  = valor; break;
            case 5:  respuesta5  = valor; break; case 6:  respuesta6  = valor; break;
            case 7:  respuesta7  = valor; break; case 8:  respuesta8  = valor; break;
            case 9:  respuesta9  = valor; break; case 10: respuesta10 = valor; break;
            case 11: respuesta11 = valor; break; case 12: respuesta12 = valor; break;
            case 13: respuesta13 = valor; break; case 14: respuesta14 = valor; break;
            case 15: respuesta15 = valor; break; case 16: respuesta16 = valor; break;
            case 17: respuesta17 = valor; break; case 18: respuesta18 = valor; break;
            case 19: respuesta19 = valor; break; case 20: respuesta20 = valor; break;
            case 21: respuesta21 = valor; break; case 22: respuesta22 = valor; break;
            case 23: respuesta23 = valor; break;
        }
    }
}
