-- Script para crear las tablas de la base de datos USAR COL-13
-- Base de datos: PostgreSQL
-- Este script se ejecutará automáticamente con Hibernate (ddl-auto=update)

-- Crear tabla de rescatistas
CREATE TABLE IF NOT EXISTS rescatistas (
    id BIGSERIAL PRIMARY KEY,
    nombre_codigo VARCHAR(100) NOT NULL UNIQUE,
    rango VARCHAR(50) NOT NULL,
    unidad VARCHAR(100) NOT NULL,
    fecha_registro BIGINT NOT NULL
);

-- Crear tabla de encuestas
CREATE TABLE IF NOT EXISTS encuestas (
    id_encuesta BIGSERIAL PRIMARY KEY,
    id_rescatista BIGINT NOT NULL,
    fecha_hora BIGINT NOT NULL,
    respuesta1 INTEGER NOT NULL,
    respuesta2 INTEGER NOT NULL,
    respuesta3 INTEGER NOT NULL,
    respuesta4 INTEGER NOT NULL,
    respuesta5 INTEGER NOT NULL,
    respuesta6 INTEGER NOT NULL,
    respuesta7 INTEGER NOT NULL,
    respuesta8 INTEGER NOT NULL,
    respuesta9 INTEGER NOT NULL,
    respuesta10 INTEGER NOT NULL,
    respuesta11 INTEGER NOT NULL,
    respuesta12 INTEGER NOT NULL,
    respuesta13 INTEGER NOT NULL,
    respuesta14 INTEGER NOT NULL,
    respuesta15 INTEGER NOT NULL,
    respuesta16 INTEGER NOT NULL,
    respuesta17 INTEGER NOT NULL,
    respuesta18 INTEGER NOT NULL,
    respuesta19 INTEGER NOT NULL,
    respuesta20 INTEGER NOT NULL,
    respuesta21 INTEGER NOT NULL,
    respuesta22 INTEGER NOT NULL,
    respuesta23 INTEGER NOT NULL,
    nivel_riesgo INTEGER NOT NULL,
    observaciones VARCHAR(500),
    FOREIGN KEY (id_rescatista) REFERENCES rescatistas(id) ON DELETE CASCADE
);

-- Crear índices para mejorar las búsquedas
CREATE INDEX IF NOT EXISTS idx_encuestas_rescatista ON encuestas(id_rescatista);
CREATE INDEX IF NOT EXISTS idx_encuestas_fecha ON encuestas(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_encuestas_riesgo ON encuestas(nivel_riesgo DESC);
CREATE INDEX IF NOT EXISTS idx_rescatistas_codigo ON rescatistas(nombre_codigo);
