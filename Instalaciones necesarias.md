# 🚀 Guía de Instalación - Sistema de Monitoreo Psicológico USAR COL-13

## ✅ Opción 1: Instalación Local (Recomendado para Desarrollo)

### Requisitos

- **Java JDK 17+** - Descarga desde: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- **Maven 3.6+** - Descarga desde: https://maven.apache.org/download.cgi
- **PostgreSQL 12+** - Descarga desde: https://www.postgresql.org/download/
- **Git** - Descarga desde: https://git-scm.com/download

### Paso 1: Verificar Instalaciones

```bash
# Verificar Java
java -version

# Verificar Maven
mvn -version

# Verificar PostgreSQL
psql --version
```

### Paso 2: Crear Base de Datos

```bash
# Conectarse a PostgreSQL (macOS/Linux)
psql -U postgres

# O en Windows, usa pgAdmin

# En la consola de PostgreSQL:
CREATE DATABASE usar_monitoreo;
\q
```

### Paso 3: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/psychological-monitoring-app.git
cd psychological-monitoring-app
```

### Paso 4: Configurar application.properties

Edita: `src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/usar_monitoreo
spring.datasource.username=postgres
spring.datasource.password=tu_password_aqui
```

### Paso 5: Compilar

```bash
mvn clean install
```

### Paso 6: Ejecutar

```bash
mvn spring-boot:run
```

✅ **Accede a**: http://localhost:8080

---

## 🐳 Opción 2: Docker (Con Docker Desktop)

### Requisitos

- **Docker Desktop** - Descarga desde: https://www.docker.com/products/docker-desktop

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/psychological-monitoring-app.git
cd psychological-monitoring-app
```

### Paso 2: Levantar Contenedores

```bash
docker-compose up -d
```

### Paso 3: Verificar Estado

```bash
docker-compose ps
```

✅ **Accede a**: http://localhost:8080

### Detener Contenedores

```bash
docker-compose down
```

### Ver Logs

```bash
docker-compose logs -f app
```

---

## ☁️ Opción 3: Despliegue en Render (Producción)

### Paso 1: Preparar Repositorio GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/psychological-monitoring-app.git
git push -u origin main
```

### Paso 2: Crear PostgreSQL en Neon.tech

1. Ve a: https://neon.tech
2. Crea una cuenta
3. Crea un proyecto
4. Copia la URL de conexión (parecida a):
   ```
   postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname
   ```

### Paso 3: Crear Web Service en Render

1. Ve a: https://render.com
2. Haz login / Crea cuenta
3. Click en "New Web Service"
4. Conecta tu repositorio GitHub
5. Configura:

| Campo | Valor |
|-------|-------|
| Name | psychological-monitoring-app |
| Environment | Docker |
| Build Command | `docker build -t app .` |
| Start Command | `docker run -p 8080:8080 app` |

6. Agregar variables de entorno:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/dbname
SPRING_DATASOURCE_USERNAME=usuario
SPRING_DATASOURCE_PASSWORD=contraseña
```

### Paso 4: Deploy

Click en "Create Web Service"

Render desplegará automáticamente en cada `git push` a `main`.

---

## 🛠️ Troubleshooting

### Error: "Connection refused" (Base de datos no conecta)

```bash
# Verificar si PostgreSQL está corriendo
psql -U postgres -c "SELECT 1"

# Si está en Docker
docker-compose restart db
```

### Error: "Port 8080 already in use"

```bash
# Cambiar puerto en application.properties
server.port=8081
```

### Error: Maven build failure

```bash
# Limpiar caché
mvn clean
rm -rf ~/.m2/repository

# Intentar de nuevo
mvn clean install
```

### Error: "Cannot find java"

Asegúrate de que Java está en tu PATH:

```bash
# Windows: Agregar a variables de entorno
# macOS/Linux: Agregar a .bash_profile o .zshrc
export JAVA_HOME=/path/to/java17
```

---

## ✅ Verificar que Todo Funciona

1. **Encuesta**: Ve a http://localhost:8080
   - Completa la encuesta
   - Verifica que se envía correctamente

2. **Dashboard**: Ve a http://localhost:8080/dashboard
   - Verifica que ves las encuestas listadas

3. **API**: 

```bash
curl http://localhost:8080/api/encuestas

curl http://localhost:8080/api/alertas
```

---

## 📱 Acceso en Red Local

Para acceder desde otro equipo en la red:

```bash
# Obtener tu IP local (macOS/Linux)
ifconfig | grep "inet "

# Obtener tu IP local (Windows)
ipconfig

# Acceder desde otro equipo
http://tu_ip_local:8080
```

---

## 📝 Notas Importantes

- **Contraseña por defecto**: Cambia `postgres` en application.properties
- **Backups**: Haz backup regular de la base de datos
- **Certificado SSL**: Configura para producción
- **Monitoreo**: Revisa los logs regularmente

```bash
# Ver logs en real tiempo
tail -f logs/app.log
```

---

**¿Necesitas ayuda?** Abre un Issue en GitHub o contacta a: desarrollo@usar-col-13.org
