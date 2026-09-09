package com.usar.monitoreo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Punto de arranque: levanta Spring, que expone los controladores y sirve
// las páginas de static/ (index, dashboard, perfil, login).
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
