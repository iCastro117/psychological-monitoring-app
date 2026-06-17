# 🚨 Sistema de Monitoreo Psicológico USAR COL-13

Aplicación web para el seguimiento y monitoreo del bienestar psicológico del personal de rescate USAR COL-13.

## 📋 Características

✅ Encuesta de 23 preguntas con interfaz intuitiva  
✅ Análisis automático del nivel de riesgo psicológico  
✅ Sistema de semáforo de riesgo (Verde → Rojo)  
✅ Dashboard de monitoreo para comandantes  
✅ Base de datos PostgreSQL  
✅ Interfaz responsiva con diseño verde oscuro  
✅ Backend Spring Boot (Java)  

## 🏗️ Estructura del Proyecto

```
psychological-monitoring-app/
├── src/
│   ├── main/
│   │   ├── java/com/usar/monitoreo/
│   │   │   ├── Application.java
│   │   │   ├── controller/
│   │   │   │   └── WebController.java
│   │   │   ├── entity/
│   │   │   │   ├── Rescatista.java
│   │   │   │   └── Encuesta.java
│   │   │   ├── repository/
│   │   │   │   ├── RescatistaRepository.java
│   │   │   │   └── EncuestaRepository.java
│   │   │   └── service/
│   │   │       └── EncuestaService.java
│   │   ├── resources/
│   │   │   ├── static/
│   │   │   │   ├── index.html
│   │   │   │   ├── dashboard.html
│   │   │   │   ├── css/
│   │   │   │   │   └── custom.css
│   │   │   │   └── js/
│   │   │   │       ├── app.js
│   │   │   │       └── dashboard.js
│   │   │   ├── application.properties
│   │   │   └── schema.sql
│   └── test/
├── pom.xml
└── README.md
```

## 🚀 Instalación Local

### Requisitos Previos

- **Java 17 o superior**
- **Maven 3.6 o superior**
- **PostgreSQL 12 o superior** (o acceso a Neon.tech)
- **Git**

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/psychological-monitoring-app.git
cd psychological-monitoring-app
```

### Paso 2: Configurar Base de Datos Local

Si usas PostgreSQL localmente:

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE usar_monitoreo;

# Salir
\q
```

### Paso 3: Configurar application.properties

Edita `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/usar_monitoreo
spring.datasource.username=postgres
spring.datasource.password=tu_password
```

### Paso 4: Compilar y Ejecutar

```bash
# Compilar con Maven
mvn clean install

# Ejecutar la aplicación
mvn spring-boot:run
```

La aplicación estará disponible en: **http://localhost:8080**

## 🌐 Despliegue en Render

### Opción 1: Usar Neon.tech para la Base de Datos

1. **Crear cuenta en Neon.tech**: https://neon.tech
2. **Crear proyecto** y copiar la URL de conexión (ejemplo):
   ```
   postgresql://user:password@ep-name.region.aws.neon.tech/dbname
   ```

### Opción 2: Estructura para Render

1. **Crear cuenta en Render**: https://render.com

2. **Crear nuevo Web Service**:
   - Conectar repositorio GitHub
   - Build command: `mvn clean install`
   - Start command: `java -jar target/monitoreo-psicologico-1.0.0.jar`

3. **Agregar variables de entorno**:
   ```
   DATABASE_URL=postgresql://usuario:password@host/dbname
   SPRING_DATASOURCE_URL=jdbc:postgresql://host/dbname
   SPRING_DATASOURCE_USERNAME=usuario
   SPRING_DATASOURCE_PASSWORD=password
   ```

### Paso a Paso: GitHub + Render Deployment

**1. Preparar el Repositorio**

```bash
# Inicializar git
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y hacer push
git remote add origin https://github.com/tu-usuario/psychological-monitoring-app.git
git branch -M main
git push -u origin main
```

**2. Conectar Render**

- Ve a https://render.com/dashboard
- Click en "New +" → "Web Service"
- Selecciona tu repositorio
- Configura:
  - **Name**: psychological-monitoring-app
  - **Runtime**: Java
  - **Build Command**: `mvn clean install`
  - **Start Command**: `java -Dserver.port=$PORT -jar target/monitoreo-psicologico-1.0.0.jar`
  - **Environment**: PostgreSQL 15+

**3. Crear PostgreSQL en Render**

- Click en "New +" → "PostgreSQL"
- Copiar connection string
- Agregar como environment variable en Web Service

**4. Deploy**

Render desplegará automáticamente en cada `git push` a `main`.

## 🛠️ Configuración de CI/CD

El proyecto incluye automatización. Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 17
      uses: actions/setup-java@v2
      with:
        java-version: 17
    - name: Build with Maven
      run: mvn clean install
    - name: Deploy to Render
      run: curl -X POST https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}
```

## 📊 Uso de la Aplicación

### Para Rescatistas

1. Acceder a `http://localhost:8080/`
2. Completar datos personales (Código, Rango, Unidad)
3. Responder las 23 preguntas
4. Confirmar envío
5. Sistema mostrará nivel de riesgo automáticamente

### Para Comandantes/Psicólogos

1. Acceder a `http://localhost:8080/dashboard`
2. Ver todas las encuestas en tiempo real
3. Filtrar por:
   - Nombre/Código
   - Nivel de riesgo
   - Fecha
4. Sistema semáforo indicará:
   - 🟢 Verde (Riesgo 1-2): Seguro continuar operaciones
   - 🟡 Amarillo (Riesgo 3): Monitoreo recomendado
   - 🟠 Naranja (Riesgo 4): Contactar psicólogo
   - 🔴 Rojo (Riesgo 5): Intervención inmediata

## 📈 Cálculo de Nivel de Riesgo

El sistema analiza automáticamente 5 preguntas críticas:
- P1: Agotamiento emocional
- P2: Pensamientos recurrentes
- P3: Dificultades para dormir
- P8: Impacto emocional
- P13: Irritabilidad/cambios de humor

**Fórmula**:
- Suma ≥ 20: **CRÍTICO (5)** 🚨
- Suma ≥ 16: **ALTO (4)** 🔴
- Suma ≥ 12: **MEDIO (3)** 🟠
- Suma ≥ 8: **BAJO (2)** 🟡
- Suma < 8: **MÍNIMO (1)** 🟢

## 🗄️ Base de Datos

### Tabla: rescatistas
```sql
- id (PK)
- nombre_codigo
- rango
- unidad
- fecha_registro
```

### Tabla: encuestas
```sql
- id_encuesta (PK)
- id_rescatista (FK)
- fecha_hora
- respuesta1 a respuesta23
- nivel_riesgo
- observaciones
```

## 🔐 Seguridad

- ✅ Datos anonymizados en reportes
- ✅ Conexión HTTPS en producción
- ✅ Validación de entrada en cliente y servidor
- ✅ CORS configurado para producción
- ✅ Confidencialidad garantizada

## 📝 Tecnologías

- **Backend**: Java 17 + Spring Boot 3.2
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **Database**: PostgreSQL 12+
- **Build**: Maven
- **Hosting**: Render
- **CI/CD**: GitHub Actions

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre Pull Request

## 📞 Contacto

Para reportar bugs o sugerencias:
- Email: desarrollo@usar-col-13.org
- Issue: GitHub Issues

## 📄 Licencia

Este proyecto está bajo licencia de USAR COL-13. Uso exclusivo del personal de rescate.

---

**Versión**: 1.0.0  
**Última actualización**: 2026-06-15  
**Desarrollado para**: USAR COL-13

```xml
<dependency>
   <groupId>mysql</groupId>
   <artifactId>mysql-connector-j</artifactId>
   <scope>runtime</scope>
</dependency>
```

Guarda `pom.xml` y ejecuta `mvn -B dependency:resolve` si quieres descargar dependencias antes de compilar.

---

## 3) Configurar `application.properties` para MySQL

Edita `src/main/resources/application.properties` y actualiza las propiedades de conexión para MySQL. Usa variables de entorno para no almacenar credenciales en el repo.

```properties
server.port=${PORT:8080}

# MySQL (ejemplo local)
spring.datasource.url=${DATABASE_URL:jdbc:mysql://localhost:3306/usarcol13?useSSL=false&serverTimezone=UTC}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false
```

Con esto, si no defines `DATABASE_URL` la app intentará conectarse a `localhost:3306/usarcol13` con el usuario `root`.

---

## 4) Ejecutar la aplicación localmente

1. Asegúrate de que MySQL está ejecutándose y que la base `usarcol13` existe (ver paso 1).
2. Exporta variables de entorno (ejemplo Windows PowerShell):

```powershell
$env:DATABASE_URL = "jdbc:mysql://localhost:3306/usarcol13?useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME = "tu_usuario"
$env:DB_PASSWORD = "tu_password"
```

3. Compilar y ejecutar (Maven):

```bash
#mvn -B clean package -DskipTests
#mvn spring-boot:run
```

4. Abre en el navegador:
- Encuesta: http://localhost:8080/
- Seguimiento: http://localhost:8080/seguimiento

---

## 5) Probar endpoints (curl)

Enviar una encuesta de prueba:

```bash
curl -s -X POST http://localhost:8080/api/encuestas \\
   -H "Content-Type: application/json" \\
   -d '{"nombreCodigo":"R-99 Test","rango":"Técnico","respuestas":[1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3]}' | jq
```

Obtener la lista de encuestas:

```bash
curl http://localhost:8080/api/encuestas | jq
```

Obtener detalle de una encuesta (id):

```bash
curl http://localhost:8080/api/encuestas/1 | jq
```

Si no tienes `jq`, puedes omitir la tubería `| jq`.

---

## 6) Ejecutar con Docker (opcional)

Si prefieres contenedores, puedes iniciar un contenedor MySQL y luego construir la imagen de la app.

Ejemplo con Docker (PowerShell / Unix similar):

```bash
# 1) Inicia MySQL en un contenedor
docker run -d --name mysql-usar -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=usarcol13 -p 3306:3306 mysql:8

# 2) Espera que MySQL esté arriba (o revisa logs)

# 3) Construye la imagen de la app
docker build -t monitoreo-usar-col13 .

# 4) Ejecuta la app enlazando variables
docker run -p 8080:8080 --env DATABASE_URL="jdbc:mysql://host.docker.internal:3306/usarcol13?useSSL=false&serverTimezone=UTC" \\
   --env DB_USERNAME=root --env DB_PASSWORD=rootpass monitoreo-usar-col13
```

Nota: en Linux reemplaza `host.docker.internal` por la IP del host o usa `--network` para conectar contenedores.

---

## 7) Desplegar en Render con MySQL (resumen)

1. En Render, crea el servicio como Web Service (Runtime: Docker) y conecta tu repo GitHub.
2. En Environment, define `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD` con tu MySQL remoto (p. ej. ClearDB, Amazon RDS, PlanetScale). Asegúrate que el host permita conexiones desde Render.
3. Build y Start siguen las mismas instrucciones del `Dockerfile` incluido.

---

## 8) Problemas comunes y solución rápida
- Error de driver JDBC: asegúrate de tener `mysql-connector-j` en `pom.xml` y haber reconstruido el proyecto.
- Error de conexión: revisa `DATABASE_URL`, usuario/contraseña y que el servidor MySQL acepte conexiones remotas.
- Tablas no creadas: con `spring.jpa.hibernate.ddl-auto=update` Hibernate creará/ajustará tablas; si prefieres correr manualmente, ejecuta el script SQL del paso 1.

---

Si quieres, puedo:
- (A) Añadir el `mysql-connector-j` al `pom.xml` automáticamente y crear un commit.
- (B) Ejecutar instrucciones de compilación local si me confirmas que Maven está disponible en este entorno.

Dime qué prefieres y lo hago a continuación.
