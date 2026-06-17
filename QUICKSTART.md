# ⚡ QUICKSTART - Sistema USAR COL-13

**¿Qué es esto?** Una aplicación web para evaluar el bienestar psicológico de rescatistas con una encuesta de 23 preguntas y análisis automático de riesgo.

**¿Cuánto tiempo?** 5 minutos para empezar

---

## 🏃 Opción 1: Más Rápido (Docker)

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/psychological-monitoring-app.git
cd psychological-monitoring-app

# 2. Ejecutar
docker-compose up -d

# 3. Abrir
# http://localhost:8080 ← Encuesta
# http://localhost:8080/dashboard ← Dashboard
```

**Listo.** Eso es todo. Termina con:
```bash
docker-compose down
```

---

## 🛠️ Opción 2: Manual (Sin Docker)

### Windows
```cmd
REM 1. Instala Java y Maven desde los links en README.md

REM 2. Crea la base de datos
psql -U postgres
CREATE DATABASE usar_monitoreo;
\q

REM 3. Cambia carpeta
cd psychological-monitoring-app

REM 4. Ejecuta
mvn spring-boot:run

REM Accede a: http://localhost:8080
```

### macOS / Linux
```bash
# 1. Instala
brew install openjdk@17 maven postgresql

# 2. Crea DB
createdb -U postgres usar_monitoreo

# 3. Ejecuta
cd psychological-monitoring-app
mvn spring-boot:run

# Accede a: http://localhost:8080
```

---

## 📝 Probarlo

1. **Abre** http://localhost:8080
2. **Completa**:
   - Nombre: `CAP-001`
   - Rango: `Capitán`
   - Unidad: `Equipo A`
   - Responde las 23 preguntas
3. **Envía**
4. **Ve al dashboard**: http://localhost:8080/dashboard

---

## 🔧 Configuración

Si la BD no es `localhost`, edita:
```
src/main/resources/application.properties
```

Cambia:
```properties
spring.datasource.url=tu-url-aqui
```

---

## 🌐 Desplegar en Render (Producción)

1. **Sube a GitHub**: Tu repositorio
2. **Ve a Render**: https://render.com
3. **Connect GitHub** y selecciona tu repositorio
4. **Render auto-deploya** en cada `git push`

[Ver detalles en README.md]

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Connection refused" | Verifica que PostgreSQL está corriendo |
| "Port 8080 in use" | Cambia el puerto en `application.properties` |
| "Permission denied" | Revisa que el usuario PostgreSQL es `postgres` |
| Build falla | Corre `mvn clean` y luego `mvn install` |

---

## 📚 Más Información

- **README.md** - Documentación completa
- **INSTALL.md** - Instalación detallada
- **API_DOCS.md** - Documentación de API

---

**¿Listo?** Corre Docker o Maven y accede a http://localhost:8080 👆

¡Éxito! 🚀
