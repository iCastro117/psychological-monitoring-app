# 📡 Documentación de API - Sistema USAR COL-13

## Base URL

```
http://localhost:8080 (desarrollo)
https://tu-app.render.com (producción)
```

## Endpoints

### 1. Obtener Página Principal
```
GET /
```
Retorna el formulario de encuesta (index.html)

**Respuesta**: HTML

---

### 2. Enviar Encuesta
```
POST /api/enviar-encuesta
Content-Type: application/json
```

**Body Request**:
```json
{
  "nombreCodigo": "CAP-001",
  "rango": "Capitán",
  "unidad": "Equipo A",
  "respuestas": [1, 2, 3, 2, 1, 4, 3, 2, 5, 1, 2, 3, 1, 2, 3, 4, 2, 1, 3, 2, 1, 5, 4]
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "mensaje": "Encuesta guardada exitosamente",
  "idEncuesta": 1,
  "nivelRiesgo": 3,
  "etiquetaRiesgo": "MEDIO"
}
```

**Response Error (500)**:
```json
{
  "success": false,
  "mensaje": "Error: [descripción del error]"
}
```

---

### 3. Obtener Todas las Encuestas
```
GET /api/encuestas
```

**Response (200)**:
```json
[
  {
    "idEncuesta": 1,
    "rescatista": {
      "id": 1,
      "nombreCodigo": "CAP-001",
      "rango": "Capitán",
      "unidad": "Equipo A",
      "fechaRegistro": 1686830400000
    },
    "fechaHora": 1686830400000,
    "respuesta1": 1,
    "respuesta2": 2,
    ...
    "respuesta23": 4,
    "nivelRiesgo": 3,
    "observaciones": null
  }
]
```

---

### 4. Obtener Encuestas con Alertas de Riesgo
```
GET /api/alertas
```

Retorna solo encuestas con nivel de riesgo ≥ 3 (Medio, Alto, Crítico)

**Response (200)**:
```json
[
  {
    "idEncuesta": 2,
    "rescatista": {...},
    "nivelRiesgo": 4,
    ...
  }
]
```

---

### 5. Dashboard
```
GET /dashboard
```

Retorna el dashboard HTML con todas las encuestas

**Response**: HTML

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 400 | Solicitud inválida |
| 404 | No encontrado |
| 500 | Error del servidor |

---

## Ejemplos con cURL

### Enviar una encuesta
```bash
curl -X POST http://localhost:8080/api/enviar-encuesta \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCodigo": "SGT-002",
    "rango": "Sargento",
    "unidad": "Equipo B",
    "respuestas": [2, 3, 2, 1, 2, 4, 3, 2, 4, 2, 3, 2, 2, 3, 4, 3, 2, 2, 2, 3, 2, 4, 3]
  }'
```

### Obtener todas las encuestas
```bash
curl http://localhost:8080/api/encuestas
```

### Obtener alertas
```bash
curl http://localhost:8080/api/alertas
```

---

## Estructura de Datos

### Rescatista
```json
{
  "id": 1,
  "nombreCodigo": "string",
  "rango": "Capitán|Teniente|Sargento|Cabo|Soldado|Bombero",
  "unidad": "string",
  "fechaRegistro": "number (timestamp)"
}
```

### Encuesta
```json
{
  "idEncuesta": 1,
  "rescatista": "Rescatista",
  "fechaHora": "number (timestamp)",
  "respuesta1-23": "1|2|3|4|5",
  "nivelRiesgo": "1|2|3|4|5",
  "observaciones": "string (opcional)"
}
```

### Escala de Riesgo
```
1 = Mínimo (Verde)
2 = Bajo (Azul)
3 = Medio (Amarillo)
4 = Alto (Naranja)
5 = Crítico (Rojo)
```

---

## Cálculo de Nivel de Riesgo

El backend calcula automáticamente el nivel de riesgo basándose en 5 preguntas críticas:

**Preguntas críticas**: 1, 2, 3, 8, 13
**Fórmula**:
- suma = respuesta[0] + respuesta[1] + respuesta[2] + respuesta[7] + respuesta[12]
- Si suma ≥ 20: Nivel 5 (Crítico)
- Si suma ≥ 16: Nivel 4 (Alto)
- Si suma ≥ 12: Nivel 3 (Medio)
- Si suma ≥ 8: Nivel 2 (Bajo)
- Si suma < 8: Nivel 1 (Mínimo)

---

## Autenticación

Actualmente sin autenticación (fase 1). 

**Para futuras versiones**:
- JWT Token
- OAuth2
- LDAP (integración militar)

---

## Rate Limiting

No configurado en fase 1. Se recomienda agregar en producción usando:
```
spring-cloud-starter-netflix-hystrix
spring-boot-starter-actuator
```

---

## CORS

Configurado para desarrollo local. Para producción, modificar:

```properties
# src/main/resources/application.properties
server.servlet.context-path=/
```

---

## Ejemplos de Respuestas

### Encuesta Recibida Correctamente
```json
{
  "success": true,
  "mensaje": "Encuesta guardada exitosamente",
  "idEncuesta": 42,
  "nivelRiesgo": 2,
  "etiquetaRiesgo": "BAJO"
}
```

### Error de Validación
```json
{
  "success": false,
  "mensaje": "Error: Todas las preguntas son requeridas"
}
```

### Error de Servidor
```json
{
  "success": false,
  "mensaje": "Error: Connection refused to database"
}
```

---

## Webhooks (Futuro)

Planes para agregar notificaciones en tiempo real:
```
POST /webhooks/alert
POST /webhooks/stats
```

---

## Versionado de API

**Versión actual**: 1.0.0
**Próxima versión**: 2.0.0 (Q3 2026)

---

**Última actualización**: 2026-06-15
**Contacto**: desarrollo@usar-col-13.org
