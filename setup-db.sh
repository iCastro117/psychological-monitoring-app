#!/bin/bash
# Script para configurar la base de datos PostgreSQL localmente
# Uso: ./setup-db.sh

echo "🚀 Configurando Base de Datos USAR COL-13..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado${NC}"
    echo "Descárgalo desde: https://www.postgresql.org/download/"
    exit 1
fi

# Crear base de datos
echo "📦 Creando base de datos 'usar_monitoreo'..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'usar_monitoreo'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE usar_monitoreo;"

echo -e "${GREEN}✅ Base de datos creada exitosamente${NC}"

# Crear tablas
echo "📊 Creando tablas..."
psql -U postgres -d usar_monitoreo << 'EOF'

CREATE TABLE IF NOT EXISTS rescatistas (
    id BIGSERIAL PRIMARY KEY,
    nombre_codigo VARCHAR(100) NOT NULL UNIQUE,
    rango VARCHAR(50) NOT NULL,
    unidad VARCHAR(100) NOT NULL,
    fecha_registro BIGINT NOT NULL
);

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

CREATE INDEX IF NOT EXISTS idx_encuestas_rescatista ON encuestas(id_rescatista);
CREATE INDEX IF NOT EXISTS idx_encuestas_fecha ON encuestas(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_encuestas_riesgo ON encuestas(nivel_riesgo DESC);
CREATE INDEX IF NOT EXISTS idx_rescatistas_codigo ON rescatistas(nombre_codigo);

EOF

echo -e "${GREEN}✅ Tablas creadas exitosamente${NC}"

# Insertar datos de prueba
echo "🧪 Insertando datos de prueba..."
psql -U postgres -d usar_monitoreo << 'EOF'

INSERT INTO rescatistas (nombre_codigo, rango, unidad, fecha_registro)
VALUES 
  ('CAP-001', 'Capitán', 'Equipo A', EXTRACT(EPOCH FROM NOW())::BIGINT),
  ('TEN-001', 'Teniente', 'Equipo B', EXTRACT(EPOCH FROM NOW())::BIGINT),
  ('SGT-001', 'Sargento', 'Equipo A', EXTRACT(EPOCH FROM NOW())::BIGINT)
ON CONFLICT DO NOTHING;

EOF

echo -e "${GREEN}✅ Datos de prueba insertados${NC}"

echo ""
echo "✨ Configuración completada exitosamente"
echo "📍 Base de datos: usar_monitoreo"
echo "👤 Usuario: postgres"
echo "🔗 URL: postgresql://localhost:5432/usar_monitoreo"
echo ""
echo "Próximo paso: Ejecuta 'mvn spring-boot:run'"
