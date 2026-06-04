# Documentación Técnica — XAcademy DEV 2026

---

## 1. Stack y Arquitectura General

| Capa | Tecnología | Versión / Detalle |
|---|---|---|
| Frontend | Angular | 20, con Zoneless Change Detection |
| UI Library | PrimeNG | Tema Aura, dark mode con `.dark-mode` class |
| API | Node.js + Express | ESM (módulos nativos), Express 5 |
| ORM | Sequelize | MySQL dialect, sin timestamps automáticos |
| Base de datos | MySQL | 8.0, charset utf8mb4 |
| IA local | Ollama | Modelo `gemma3:latest` (3.34 GB) |
| Servidor estático | Nginx | Sirve el build de Angular y hace proxy reverso a la API |
| Orquestación | Docker Compose | 5 servicios: db, ollama, ollama-init, api, frontend |

### Flujo general de una request

```
Browser → Nginx (:4200)
  └─ /api/* → proxy → Express API (:8080)
                  └─ Routes → Controllers → Services → Repositories → MySQL
                                                             ↓
                                                     Sequelize Models / Vistas SQL
```

Para el análisis de IA:
```
Frontend → GET /api/ia/jugador/:id/analisis
  └─ API → Ollama (:11434 interno) → gemma3 → respuesta blocking
```

---

## 2. Cómo levantar el proyecto

### Prerequisitos

- Docker y Docker Compose instalados
- Archivo `.env` en la raíz con las variables (ver sección de variables)
- Ollama descarga automáticamente el modelo `gemma3` (~3.34 GB) en el primer arranque

### Levantar todo

```bash
docker compose up -d
```

Esto levanta los 5 servicios en orden correcto:
1. `db` — MySQL 8.0 (espera hasta estar healthy con retries de 10)
2. `ollama` — servidor LLM
3. `ollama-init` — descarga el modelo gemma3 (solo corre una vez, luego sale)
4. `api` — Node.js Express (espera a que `db` esté healthy y `ollama` esté started)
5. `frontend` — Nginx con Angular (espera a que `api` esté started)

### Comandos de uso frecuente

```bash
# Rebuild completo (necesario cuando cambia el Dockerfile o package.json)
docker compose build

# Rebuild y reinicio de un solo servicio
docker compose build api
docker compose build frontend

# Hot-restart de la API (el código fuente está montado como volumen, no necesita rebuild)
docker compose restart api

# Ver logs en tiempo real
docker compose logs api --tail=50
docker compose logs frontend --tail=20
docker compose logs db --tail=30

# Detener todo
docker compose down

# Detener y borrar volúmenes (útil para reiniciar la DB desde cero)
docker compose down -v
```

### Puertos expuestos al host

| Servicio | Puerto host | Puerto contenedor | URL |
|---|---|---|---|
| Frontend (Nginx) | `${FRONTEND_PORT}` (4200) | 80 | http://localhost:4200 |
| API Express | `${PORT}` (8080) | `${PORT}` | http://localhost:8080 |
| MySQL | `${DB_PORT}` (3306) | 3306 | localhost:3306 |
| Ollama | 11435 | 11434 | http://localhost:11435 |
| Swagger UI | — | — | http://localhost:8080/api/docs |

> Nota importante: la API se comunica con Ollama usando el puerto interno `11434` (`http://ollama:11434`). El puerto `11435` es solo para acceso externo desde el host.

### Variables de entorno requeridas (`.env` en la raíz)

```env
# Servidor
PORT=8080
NODE_ENV=development
FRONTEND_PORT=4200

# Base de datos
DB_PORT=3306
DB_NAME=fifa_db
DB_USER=root
DB_PASSWORD=<password>
DB_DIALECT=mysql

# JWT
JWT_SECRET=<secreto_largo>
JWT_EXPIRES_IN=1h
COOKIE_SECRET=<secreto_para_firmar_cookies>

# OAuth (opcionales — tienen fallbacks vacíos, no bloquean el arranque)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

# Mail (opcional — tiene fallbacks)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=

# IA (OpenAI — opcional, el proyecto usa Ollama local)
OPENAI_API_KEY=
```

### Problema de tildes / encoding

Si los caracteres especiales (tildes, ñ) aparecen corruptos en la DB:

```bash
# Borrar el volumen de MySQL y reiniciar
docker compose down -v
docker compose up -d
```

El `init.sql` tiene `SET NAMES utf8mb4` al inicio y MySQL arranca con `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`. Sequelize usa `charset: 'utf8mb4'` en `dialectOptions`. Si el volumen ya existe con encoding incorrecto, hay que recrearlo.

---

## 3. Cómo testear

### Swagger UI

La documentación interactiva está disponible en: `http://localhost:8080/api/docs`

- 25 endpoints documentados
- 9 tags: Auth, Jugadores, Ligas, Clubes, Nacionalidades, Posiciones, Skills, Versiones, IA
- Auth via `cookieAuth` (cookie `access_token`)
- Para testear endpoints protegidos: primero hacer POST `/api/auth/login` (que establece la cookie), luego los demás endpoints funcionan automáticamente en la misma sesión del browser

### Credenciales de prueba (cargadas en el init.sql)

| Usuario | Email | Contraseña | Método |
|---|---|---|---|
| jperez | juan@email.com | (bcrypt hash — no funciona en dev sin reemplazar el hash) | local |
| mlopez | maria@email.com | — | Google OAuth |
| cgarcia | carlos@email.com | — | GitHub OAuth |

Para crear un usuario local funcional desde cero: usar `POST /api/auth/register` con JSON `{ "Nombre": "...", "Apellido": "...", "NombreUsuario": "...", "Email": "...", "Pwd": "MiPassword1!" }`.

### Test de Ollama

```bash
# Ver modelos disponibles en Ollama
curl -s http://localhost:11435/api/tags

# Test del endpoint de IA (necesita cookie válida)
curl -b cookies.txt http://localhost:8080/api/ia/jugador/1/analisis
```

### Ver logs de errores

```bash
# Dentro del contenedor los logs se guardan en /api/logs/logs.errors
docker compose exec api cat /api/logs/logs.errors
```

### Verificar charset de MySQL

```bash
docker compose exec db mysql -uroot -p${DB_PASSWORD} fifa_db -e "SHOW VARIABLES LIKE 'character_set%';"
```

---

## 4. Base de Datos

El schema completo está en `xacademy-database/init.sql` y se carga automáticamente al iniciar el contenedor `db` (MySQL ejecuta cualquier `.sql` en `/docker-entrypoint-initdb.d/` en el primer arranque del volumen).

### 4.1 Tablas

#### Nacionalidad

Catálogo de países. Evita strings libres inconsistentes como "Argentina" / "argentina" / "ARG".

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(100) UNIQUE | Nombre del país |

Referenciada por `Liga.IdNacionalidad` y `Jugador.IdNacionalidad`.
Se cargan 30 nacionalidades iniciales (las más comunes en el dataset FIFA).

---

#### Liga

Ligas de fútbol del mundo. Cada liga pertenece a un país.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(100) UNIQUE | Nombre de la liga |
| `IdNacionalidad` | INT NOT NULL | FK → Nacionalidad. Restricción DELETE RESTRICT (no se puede borrar un país con ligas) |

Se cargan 10 ligas iniciales: La Liga, Premier League, Serie A, Ligue 1, Bundesliga, Eredivisie, Liga Profesional, Brasileirao, Primeira Liga, Pro League.

---

#### Club

Clubes de fútbol. El campo `IdLiga` es nullable porque algunos clubes del dataset no tienen liga registrada en el juego (Inter Miami de la MLS, Al Nassr de la Saudi Pro League).

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(100) UNIQUE | Nombre del club |
| `IdLiga` | INT NULL | FK → Liga. Si se borra la liga, queda NULL (ON DELETE SET NULL) |

Se cargan 25 clubes representativos. Los clubes de ligas no registradas tienen `IdLiga = NULL`.

---

#### Posicion

Catálogo de posiciones de juego. Sin campo `EsArquero` — esa distinción se maneja por `Skill.EsArquero`.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(50) UNIQUE | Sigla de la posición (GK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST) |

El backend detecta si la posición principal es `GK` para cargar las skills de arquero (DIV, HAN, KIC, REF, SPE, POS) en lugar de las de campo (PAC, SHO, PAS, DRI, DEF, PHY).

---

#### Version

Ediciones del juego FIFA del 2015 al 2023.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Anio` | INT UNIQUE | Año de la edición |
| `Nombre` | VARCHAR(50) UNIQUE | Nombre completo (ej: "FIFA 15", "EA FC 2023") |

Permite agregar futuras ediciones sin alterar la estructura de ninguna otra tabla.

---

#### Skill

Catálogo de todas las habilidades posibles. Reemplaza las columnas fijas del diseño original y elimina la necesidad de una tabla separada para arqueros.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(50) UNIQUE | Sigla (PAC, SHO, PAS, DRI, DEF, PHY, DIV, HAN, KIC, REF, SPE, POS) |
| `EsArquero` | BOOLEAN DEFAULT FALSE | Distingue skills de campo de skills de arquero |

Skills de campo (EsArquero=FALSE): PAC (Velocidad), SHO (Disparo), PAS (Pase), DRI (Regate), DEF (Defensa), PHY (Físico).
Skills de arquero (EsArquero=TRUE): DIV (Estiramiento), HAN (Manejo), KIC (Patada), REF (Reflejos), SPE (Velocidad), POS (Posicionamiento).

---

#### Usuario

Soporta tres métodos de autenticación. El constraint `chk_auth` garantiza la consistencia entre `AuthProvider`, `Pwd` y `ProviderId` directamente en la DB.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(100) | — |
| `Apellido` | VARCHAR(100) | — |
| `NombreUsuario` | VARCHAR(50) UNIQUE | Username de login |
| `Email` | VARCHAR(150) UNIQUE | Email único |
| `Pwd` | VARCHAR(255) NULL | Hash bcrypt. NULL para usuarios OAuth |
| `AuthProvider` | VARCHAR(50) DEFAULT 'local' | 'local', 'google' o 'github' |
| `ProviderId` | VARCHAR(255) NULL | ID del proveedor OAuth. NULL para usuarios locales |

Constraint `chk_auth`:
- Si `AuthProvider = 'local'` → `Pwd` obligatorio y `ProviderId` debe ser NULL
- Si `AuthProvider != 'local'` → `ProviderId` obligatorio y `Pwd` debe ser NULL

---

#### Jugador

Tabla maestra. Solo almacena datos de identidad que no cambian entre versiones del juego. Todo lo variable vive en `VersionJugador` y sus tablas relacionadas.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `Nombre` | VARCHAR(100) | — |
| `Apellido` | VARCHAR(100) | — |
| `FechaNacimiento` | DATE NULL | Nullable porque datos del CSV pueden no tenerla. La edad se calcula con `TIMESTAMPDIFF`, nunca se almacena |
| `EsHombre` | BOOLEAN NOT NULL | Permite filtrar hombres/mujeres |
| `EsRetirado` | BOOLEAN DEFAULT FALSE | Si TRUE, `AnioRetiro` debe tener valor (constraint `chk_retiro`) |
| `AnioRetiro` | INT NULL | Año de retiro. Consistente con `EsRetirado` vía constraint |
| `EsDelJuegoBase` | BOOLEAN DEFAULT FALSE | TRUE = importado del CSV. FALSE = creado por usuario |
| `EsActivo` | BOOLEAN DEFAULT TRUE | FALSE = borrado lógico. Solo jugadores creados por usuarios pueden desactivarse (constraint `chk_estado`) |
| `IdNacionalidad` | INT NOT NULL | FK → Nacionalidad |
| `IdUsuarioCreador` | INT NULL | FK → Usuario. NULL para jugadores del CSV |

Dos constraints de integridad:
- `chk_retiro`: si EsRetirado=TRUE entonces AnioRetiro NOT NULL, y viceversa
- `chk_estado`: un jugador con EsDelJuegoBase=TRUE no puede tener EsActivo=FALSE (los jugadores del CSV no se pueden desactivar)

Nunca se borran jugadores físicamente. El borrado lógico se hace con `EsActivo = FALSE`.

---

#### VersionJugador

Snapshot del jugador en una edición específica del juego. Una fila por jugador por edición.

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | INT AUTO_INCREMENT | PK |
| `IdJugador` | INT NOT NULL | FK → Jugador. CASCADE DELETE |
| `IdVersion` | INT NOT NULL | FK → Version. RESTRICT DELETE |
| `IdClub` | INT NOT NULL | FK → Club. RESTRICT DELETE |
| `ImagenPath` | VARCHAR(500) NULL | Path relativo a la imagen en esa versión (vive acá porque varía por edición) |
| `Calificacion` | INT DEFAULT 0 | Promedio de skills, entre 0 y 99. Calculado por el backend y almacenado para que el listado sea rápido sin AVG/GROUP BY |

UNIQUE en `(IdJugador, IdVersion)` — un jugador no puede tener dos registros en el mismo año.

La `Calificacion` nunca se calcula en una query de listado. El backend la calcula al crear/editar un jugador y la guarda en transacción. Para importación CSV se hace un UPDATE masivo al final.

> **Inconsistencia conocida:** el endpoint `POST /api/jugador` (creación manual) valida que la `calificacion` enviada coincida con el promedio de skills calculado internamente. El endpoint `POST /api/jugador/import` (CSV) almacena el valor de `calificacion` que viene en el archivo sin recalcularlo ni validarlo. Si el CSV tiene `calificacion=99` con skills promedio 50, la DB queda con 99. Es intencional para respetar los datos del juego base, pero permite inconsistencias si se editan CSVs a mano.

---

#### VersionJugadorPosicion

Tabla intermedia para la relación muchos-a-muchos entre `VersionJugador` y `Posicion`. Un jugador puede tener varias posiciones en una versión (ej: Messi como RW y CF).

| Campo | Tipo | Descripción |
|---|---|---|
| `IdVersionJugador` | INT NOT NULL | FK → VersionJugador. CASCADE DELETE |
| `IdPosicion` | INT NOT NULL | FK → Posicion. RESTRICT DELETE |
| `EsPrincipal` | BOOLEAN DEFAULT FALSE | Solo una posición puede ser principal por versión |

PK compuesta: `(IdVersionJugador, IdPosicion)`.

El índice único parcial `uq_versionjugador_principal` garantiza que haya como máximo UNA posición con `EsPrincipal=TRUE` por `IdVersionJugador`. Se implementa con una expresión de índice de MySQL 8+ porque un UNIQUE compuesto con booleanos no funciona correctamente.

---

#### VersionJugadorSkill

Tabla pivot con mayor volumen del sistema. Estimación: ~18.000 jugadores × 9 versiones × 6 skills = ~972.000 filas.

| Campo | Tipo | Descripción |
|---|---|---|
| `IdVersionJugador` | INT NOT NULL | FK → VersionJugador. CASCADE DELETE |
| `IdSkill` | INT NOT NULL | FK → Skill. RESTRICT DELETE |
| `Valor` | INT NOT NULL | Valor de la skill, entre 0 y 99 (constraint chk) |

PK compuesta: `(IdVersionJugador, IdSkill)`. MySQL genera automáticamente un índice sobre esta PK, haciendo muy rápida la búsqueda por `IdVersionJugador` (primer campo).

---

### 4.2 Vistas SQL

#### vw_ListadoJugadores

Para la pantalla principal de cards del frontend. Devuelve una fila por versión de jugador con su posición principal (solo la que tiene `EsPrincipal=TRUE`).

La `Calificacion` ya viene precalculada desde `VersionJugador` — sin AVG, sin GROUP BY en esta consulta. Esto hace que el listado paginado con filtros sea una query simple.

Columnas: `IdVersionJugador`, `IdJugador`, `IdVersion`, `EsHombre`, `IdUsuarioCreador`, `EsDelJuegoBase`, `Juego`, `Foto`, `Nombre`, `Apellido`, `Nacionalidad`, `Club`, `PosicionPrincipal`, `Calificacion`.

Uso típico desde el backend:
```sql
SELECT * FROM vw_ListadoJugadores
WHERE (EsDelJuegoBase = 1 OR IdUsuarioCreador = :idUsuario)
AND   IdVersion = :versionId
ORDER BY Calificacion DESC
LIMIT 20 OFFSET 0;
```

El backend también aplica filtros por `EsHombre`, `IdUsuarioCreador`, etc.

---

#### vw_DetalleJugador

Para la pantalla de detalle individual de un jugador. Devuelve múltiples filas: una por cada skill del jugador en esa versión, con todos los datos del jugador repetidos. El service agrupa estas filas en un único objeto de respuesta.

Columnas: `IdVersionJugador`, `IdJugador`, `Juego`, `Nombre`, `Apellido`, `IdNacionalidad`, `Nacionalidad`, `IdClub`, `Club`, `IdLiga`, `ImagenUrl`, `IdSkill`, `Skill`, `ValorSkill`, `Calificacion`.

Esta vista alimenta también el radar chart del frontend: el service extrae `labels` (nombres de skills) y `skillsData` (valores numéricos) de las filas devueltas.

---

#### vw_EvolucionSkillJugador

Para la línea de tiempo histórica de un jugador. Devuelve la evolución de todas sus skills a través de todos los años FIFA disponibles, ordenada cronológicamente.

Columnas: `IdJugador`, `Nombre`, `Apellido`, `IdSkill`, `Skill`, `AnioJuego`, `Juego`, `ValorSkill`.

Usos:
- Filtrada por `IdJugador` + `IdSkill` → serie temporal de una skill para el gráfico de línea del frontend
- Filtrada por `IdJugador` completo → trayectoria completa que se envía a Ollama para el análisis de IA

---

### 4.3 Diagrama de relaciones (descripción textual)

```
Nacionalidad
  ├─ Liga (IdNacionalidad) [N ligas por país]
  │    └─ Club (IdLiga) [N clubes por liga, nullable]
  └─ Jugador (IdNacionalidad) [N jugadores por país]
       │
       ├─ Usuario (IdUsuarioCreador, nullable) [quién creó el jugador]
       │
       └─ VersionJugador (IdJugador) [1 fila por jugador×año]
            │   ├─ Version (IdVersion)
            │   └─ Club (IdClub)
            │
            ├─ VersionJugadorPosicion (IdVersionJugador) [N posiciones por versión]
            │    └─ Posicion (IdPosicion)
            │
            └─ VersionJugadorSkill (IdVersionJugador) [N skills por versión]
                 └─ Skill (IdSkill)
```

Reglas de borrado:
- Borrar `Jugador` → cascade a `VersionJugador` → cascade a `VersionJugadorPosicion` y `VersionJugadorSkill`
- Borrar `Liga` → `Club.IdLiga` pasa a NULL (ON DELETE SET NULL)
- Borrar `Usuario` → `Jugador.IdUsuarioCreador` pasa a NULL (ON DELETE SET NULL)
- Borrar `Nacionalidad`, `Version`, `Club`, `Posicion`, `Skill` con registros dependientes → RESTRICT (error)

---

### 4.4 Índices adicionales

Además de los índices automáticos sobre FKs, el schema crea índices explícitos para las queries más frecuentes:

| Índice | Tabla | Campo | Para qué |
|---|---|---|---|
| `idx_versionjugador_idversion` | VersionJugador | IdVersion | Filtrar por edición del juego |
| `idx_versionjugador_idclub` | VersionJugador | IdClub | Filtrar por club en listado |
| `idx_versionjugador_calificacion` | VersionJugador | Calificacion | ORDER BY calificación |
| `idx_vjposicion_idposicion` | VersionJugadorPosicion | IdPosicion | Filtrar por posición |
| `idx_vjposicion_esprincipal` | VersionJugadorPosicion | EsPrincipal | Filtrar solo posición principal |
| `idx_versionjugadorskill_idvj` | VersionJugadorSkill | IdVersionJugador | Detalle + radar chart |
| `idx_jugador_esactivo` | Jugador | EsActivo | Filtro más común del listado |
| `idx_jugador_esdeljuegobase` | Jugador | EsDelJuegoBase | Distinguir CSV vs creados |
| `idx_usuario_authprovider` | Usuario | AuthProvider | Passport OAuth callback |
| `idx_usuario_providerid` | Usuario | ProviderId | Passport OAuth callback |

---

## 5. API

### 5.1 Estructura de carpetas

```
xacademy-api/src/
├── server.js           # Punto de entrada: importa app.js, conecta DB, levanta el server
├── app.js              # Configuración de Express: middleware chain, rutas, Swagger
├── config/
│   ├── env.js          # Variables de entorno con fallbacks seguros
│   ├── database.js     # Configuración de Sequelize (pool, opciones globales)
│   ├── passport.js     # Estrategia JWT extrayendo token de cookies
│   ├── swagger.js      # Configuración de Swagger UI y schemas compartidos
│   └── winston.js      # Logger solo para errores, con rotación de archivos
├── core/
│   ├── base.controller.js   # getAll, getById, create, update, delete genéricos
│   ├── base.service.js      # getAll, getById, create, update, delete genéricos
│   └── base.repository.js  # findAll, findById, findByField, create, update, delete con Sequelize
├── db/
│   ├── connection.js   # Instancia de Sequelize, función connectDB()
│   └── models/         # Un archivo por tabla y por vista SQL
├── DI/                 # Dependency Injection: un container por módulo
├── routes/             # Un archivo por módulo, solo define endpoints y middleware
├── controllers/        # Reciben req/res, extraen parámetros, delegan al service
├── services/           # Lógica de negocio pura, sin conocimiento de HTTP
├── repositories/       # Acceso a datos via Sequelize, sin lógica de negocio
├── middleware/
│   ├── auth.js         # silentRefresh, requireAuth, alreadyAuth
│   ├── auth.validator.js
│   ├── jugador.validator.js
│   └── upload.js       # Multer para imágenes WebP y archivos CSV
├── utils/
│   ├── jwt.js          # generateAccessToken, generateRefreshToken, verifyToken
│   ├── cookies.js      # setTokenCookies
│   └── bcrypt.js       # hashPassword, comparePassword
└── dtos/               # Data Transfer Objects para validar y sanitizar entradas
```

### Cadena de middleware en app.js

Aplicados en este orden sobre cada request:

1. **CORS** — permite origen `http://localhost:4200` con `credentials: true`
2. **Helmet** — headers de seguridad HTTP, con `crossOriginResourcePolicy: cross-origin` para permitir cargar imágenes
3. **Compression** — compresión Brotli + Gzip de respuestas
4. **express.json() + urlencoded** — parseo de bodies
5. **cookieParser** — parsea y verifica cookies firmadas con `COOKIE_SECRET`
6. **passport.initialize()** — inicializa Passport (sin sesiones, solo JWT)
7. **silentRefresh** — middleware global de renovación transparente de tokens (ver sección 5.3)
8. **`/img`** — archivos estáticos (fotos de jugadores)
9. **`/api/docs`** — Swagger UI
10. **`/api`** — rutas de la API

### Patrón de Dependency Injection (DI)

Cada módulo tiene un "container" en `src/DI/` que instancia manualmente las clases e inyecta las dependencias:

```javascript
// Ejemplo: jugador.container.js
const jugadorRepository = new JugadorRepository();
const jugadorService    = new JugadorService(jugadorRepository);
const jugadorController = new JugadorController(jugadorService);
export default jugadorController;
```

Las rutas importan directamente el controlador ya ensamblado. No hay framework de DI externo — la wiring se hace explícitamente a mano, lo que hace el flujo completamente trazable.

### Clases base (src/core/)

`BaseRepository` provee: `findAll`, `findById`, `findByField`, `findAllByField`, `create`, `update` (con re-fetch post-update porque MySQL no devuelve el registro actualizado), `delete`.

`BaseService` provee: `getAll`, `getById` (con throw si no existe), `create`, `update`, `delete`.

`BaseController` provee: `getAll`, `getById`, `create`, `update`, `delete` — todos con manejo de errores y logging a Winston. Distingue 404 (cuando el error incluye "no encontrado") de 500.

Los módulos más complejos como `jugador` sobrescriben estos métodos para agregar lógica específica (paginación, validación de skills, transacciones).

---

### 5.2 Módulos

#### Auth (`/api/auth`)

| Endpoint | Método | Middleware previo | Descripción |
|---|---|---|---|
| `/register` | POST | `alreadyAuth`, `validateRegister` | Registra usuario local. Devuelve 400 si ya existe el email |
| `/login` | POST | `alreadyAuth`, `validateLogin` | Autentica. Establece cookies httpOnly con access + refresh token |
| `/logout` | POST | `requireAuth` | Limpia cookies. No hace ninguna operación en DB |
| `/me` | GET | `requireAuth` | Devuelve datos del usuario autenticado desde `req.user` |

---

#### Jugadores (`/api/jugador`)

Todos los endpoints requieren autenticación (`requireAuth` aplicado a nivel de router).

| Endpoint | Método | Descripción |
|---|---|---|
| `/` | GET | Listado paginado con filtros: `page`, `limit`, `versionId`, `esHombre`, `creadoPorMi`, `nombre`, `clubId`, `nacionalidadId`, `posicionId` |
| `/export` | GET | Export completo (sin paginación) en formato JSON para que el frontend lo convierta a CSV |
| `/import` | POST | Importa jugadores desde un archivo CSV multipart. Usa Multer con memoryStorage. **La `calificacion` se almacena tal como viene en el CSV, sin recalcular desde las skills** (ver nota en §4.1 VersionJugador) |
| `/:id` | GET | Detalle completo de una versión de jugador (por IdVersionJugador) |
| `/:id/jugador-id` | GET | Resuelve IdVersionJugador → IdJugador (necesario para consultar la IA) |
| `/:id/evolucion` | GET | Evolución histórica de una skill específica (`?skillId=N`) |
| `/` | POST | Crea jugador con imagen opcional (multipart/form-data, WebP obligatorio) |
| `/:id` | PUT | Actualiza jugador existente (por IdVersionJugador) |
| `/:id` | DELETE | Borrado lógico del jugador |

La creación y actualización son operaciones transaccionales: insertan/actualizan en 4 tablas (`Jugador`, `VersionJugador`, `VersionJugadorPosicion`, `VersionJugadorSkill`) en una única transacción de Sequelize con rollback automático en caso de error.

Validaciones que el service aplica antes de persistir:
- Exactamente una posición con `esPrincipal=true`
- No hay posiciones repetidas
- Todos los valores de skills entre 0 y 99
- La `calificacion` enviada coincide con el promedio calculado internamente (evita manipulación del cliente)

---

#### Liga (`/api/liga`), Club (`/api/club`), Nacionalidad (`/api/nacionalidad`), Posicion (`/api/posicion`), Skill (`/api/skill`), Version (`/api/version`)

Módulos CRUD estándar. Todos extienden `BaseController` sin sobrescribir nada. Exponen: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

---

#### IA (`/api/ia`)

| Endpoint | Método | Descripción |
|---|---|---|
| `/jugador/:id/analisis` | GET | Análisis narrativo de la evolución del jugador. Requiere auth. El `:id` es `IdVersionJugador` — se resuelve internamente a `IdJugador` para buscar la trayectoria completa |

El endpoint funciona en modo blocking: espera la respuesta completa de Ollama antes de devolver. El tiempo de respuesta varía entre 25 y 46 segundos dependiendo del hardware. La alternativa de streaming SSE existe en el diseño (documentada en CLAUDE.md) pero no está expuesta en las rutas actuales.

---

### 5.3 Autenticación

#### Tokens

La API emite dos tokens JWT en cookies HttpOnly:
- **access_token**: corto plazo (configurable via `JWT_EXPIRES_IN`), usado para autenticar requests
- **refresh_token**: largo plazo, usado para renovar el access_token silenciosamente

En producción las cookies son `signed: true` y `secure: true`. En desarrollo son sin firmar y sin HTTPS para facilitar el testing.

#### silentRefresh (middleware global)

Aplicado a TODAS las rutas como el quinto middleware en `app.js`. Lógica:

1. Si no hay refresh_token → pasar al siguiente middleware (el usuario no tiene sesión)
2. Si hay access_token válido → pasar al siguiente middleware (sesión activa, no hacer nada)
3. Si el access_token está vencido pero hay refresh_token válido → generar nuevos tokens, actualizar cookies, inyectar el nuevo access_token en `req.signedCookies` para que Passport lo encuentre en el mismo request
4. Si el refresh_token es inválido → limpiar ambas cookies

Esto permite que la sesión se renueve de forma completamente transparente para el usuario y el frontend.

#### requireAuth

Middleware que invoca `passport.authenticate('jwt', { session: false })`. Si no hay token válido, devuelve `{ error: 'Autenticación requerida' }` con status 401. Si el token es válido, agrega `req.user` con el registro completo del `UsuarioModel`.

#### alreadyAuth

Middleware de protección inversa: si ya hay un access_token, devuelve 400 con `{ error: 'Ya tenés una sesión activa' }`. Aplicado en `/register` y `/login` para evitar que un usuario logueado cree otra cuenta sin desloguearse.

#### Passport JWT

La estrategia extrae el token de `req.signedCookies.access_token` o `req.cookies.access_token` (intenta primero el firmado). Una vez decodificado, busca al usuario por email en la DB y lo adjunta a la request.

---

### 5.4 Integración IA (Ollama)

El servicio de IA (`src/services/ia.service.js`) instancia el cliente `Ollama` con el host configurado via variable de entorno `OLLAMA_HOST` (en Docker Compose apunta a `http://ollama:11434`).

Flujo del análisis:

1. `IAController.analyzePlayer(req)` recibe `id` (IdVersionJugador)
2. Llama a `jugadorService.getIdJugador(id)` → obtiene `IdJugador` real
3. Llama a `jugadorService.getTrajectory(IdJugador)` → query a `vw_EvolucionSkillJugador`, devuelve todas las filas de todas las skills a través de todos los años ordenadas cronológicamente
4. `IAService.analyzePlayer(jugador, trayectoria)` construye el prompt con el historial textual
5. Llama a `ollama.chat()` con el modelo `gemma3`, `temperature: 0.7`, `num_predict: 400`
6. Devuelve el texto generado como `{ analisis: "..." }`

Prompt enviado a Ollama (paráfrasis): "Eres un analista de datos de fútbol profesional. Analiza la evolución de habilidades de [Nombre Apellido] a lo largo del tiempo: [historial año-skill-valor]. Devuelve un párrafo resumen en español que detalle cómo varían las habilidades. Menciona picos de rendimiento, declives y transiciones importantes. Sé específico con los años y los valores. Solo un párrafo fluido y natural."

#### Logging de errores

Winston está configurado para capturar solo nivel `error`. Escribe en `xacademy-api/logs/logs.errors` con rotación de 5MB y máximo 5 archivos. No tiene console transport para no inundar la consola de Docker. Todos los controllers llaman `logger.error(error)` en sus bloques `catch`.

---

## 6. Frontend

### 6.1 Estructura de carpetas

```
xacademy-webpage/src/app/
├── app.ts              # Componente raíz
├── app.routes.ts       # Rutas principales con guards
├── app.config.ts       # Configuración de Angular: providers, APP_INITIALIZER, PrimeNG
├── core/
│   ├── guards/
│   │   └── auth-guard.ts       # authGuard + guestGuard
│   ├── models/                 # Interfaces TypeScript (no tienen lógica)
│   │   ├── player.model.ts     # Player, PaginatedPlayers, PlayerDetailData, PlayerCreateDto, PlayerUpdateDto, PlayerFilters
│   │   ├── user.model.ts
│   │   ├── skill.model.ts
│   │   ├── version.model.ts
│   │   ├── club.model.ts
│   │   ├── liga.model.ts
│   │   ├── nacionalidad.model.ts
│   │   └── position.model.ts
│   └── services/               # Services con `providedIn: 'root'`
│       ├── auth.ts             # AuthService — estado de sesión con signals
│       ├── player.ts           # PlayerService — listado, detalle, CRUD, IA
│       ├── skill.ts            # SkillService
│       ├── export.ts           # ExportService — convierte JSON a archivo CSV
│       └── form-data.ts        # FormDataService — carga datos para los formularios
├── features/
│   ├── auth/
│   │   ├── login/              # Componente de login
│   │   ├── register/           # Componente de registro
│   │   └── auth.routes.ts
│   └── players/
│       ├── players-list/       # Pantalla principal con tabla, filtros, paginación
│       ├── player-detail/      # Detalle de jugador con radar chart, análisis IA, timeline
│       ├── player-form/        # Formulario de creación y edición (modo dual)
│       ├── player-card-header/ # Header de la card de detalle (foto, nombre, rating)
│       ├── player-filters/     # Filtros: versión, género, "creados por mí"
│       ├── player-table/       # Tabla PrimeNG con columnas y acciones
│       ├── import-csv/         # Componente de importación de CSV
│       ├── skill-timeline/     # Gráfico de evolución de una skill en el tiempo
│       └── players.routes.ts
└── shared/
    ├── components/
    │   ├── navbar/             # Barra de navegación con usuario activo y logout
    │   ├── footer/             # Pie de página estático
    │   ├── radar-chart/        # Chart.js tipo radar para visualizar skills
    │   ├── loading-spinner/    # Spinner de carga reutilizable
    │   └── confirm-dialog/     # Dialog de confirmación genérico con eventos
    └── pipes/
```

---

### 6.2 Features

#### Auth (`/auth`)

Dos componentes: `Login` y `Register`. Ambos están protegidos con `guestGuard` — si el usuario ya tiene sesión, el guard lo redirige a `/players`.

El `Login` hace POST a `/api/auth/login` y, si es exitoso, la cookie httpOnly se establece del lado del servidor. El `AuthService` actualiza el signal `currentUser` con los datos del usuario.

El `Register` hace POST a `/api/auth/register`. No logea automáticamente (el usuario debe hacer login después).

---

#### Players (`/players`)

##### PlayersList (`/players`)

Pantalla principal. Contiene:
- `PlayerFilters` — dropdowns para filtrar por versión, género y "creados por mí"
- `PlayerTable` — tabla PrimeNG con las columnas: foto, nombre, posición, rating, club, nacionalidad, acciones (ver detalle, editar)
- Paginación con página actual, total de páginas y registros
- Botón "Nuevo jugador" que abre `PlayerForm` en un `Dialog` de PrimeNG (modo create)
- Botón "Importar CSV" que abre `ImportCsv` en un `Dialog`
- Botón "Exportar CSV" que descarga el listado actual como archivo `.csv`

Todos los estados de carga, filtros, página y datos se manejan con signals de Angular.

##### PlayerDetail (`/players/:id`)

Pantalla de detalle. Carga el jugador por `IdVersionJugador` (el `:id` de la URL). Muestra:
- `PlayerCardHeader` — foto del jugador, nombre, calificación global, versión del juego, club, posición principal
- `RadarChart` — gráfico de radar con las skills del jugador
- Botón "Ver evolución de skill" — despliega `SkillTimeline` con un dropdown de skills
- Botón "Analizar con IA" — llama a `/api/ia/jugador/:id/analisis` y muestra el texto generado. Si ya se cargó, alterna la visibilidad sin hacer una segunda llamada

##### PlayerForm (`/players/:id/edit` o modal en PlayersList)

Formulario Reactivo de Angular que funciona en dos modos:

- **Modo create** (sin `:id` en la URL o como modal): campos adicionales de fecha de nacimiento, versión del juego, y género
- **Modo edit** (`/players/:id/edit`): pre-carga todos los datos del jugador incluyendo posiciones y skills actuales

Lógica clave del formulario:
- Seleccionar GK como posición limpia todas las demás posiciones y cambia las skills a las de arquero (DIV, HAN, KIC, REF, SPE, POS)
- Seleccionar cualquier otra posición después de GK impide agregar GK simultáneamente
- La calificación se recalcula automáticamente como el promedio de los valores de skills (usando `computed` signal y `valueChanges`)
- La imagen debe ser WebP (validado tanto en el frontend como en el backend con Multer)
- Las posiciones y skills se serializan como JSON strings dentro del FormData multipart porque la request incluye el archivo de imagen

---

### 6.3 Sistema de autenticación en el cliente

El estado de autenticación vive en `AuthService` como un signal privado:

```typescript
private currentUser = signal<User | null>(null);
```

Este signal es la fuente de verdad para todo el sistema de guards. `isLoggedIn()` simplemente verifica si el signal es diferente de `null`. El guard es una función síncrona que no hace llamadas HTTP.

El motivo por el que esto funciona (sin race conditions entre el guard y la sesión real del server) es el `APP_INITIALIZER`:

```typescript
// app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: initAuth,
  deps: [AuthService],
  multi: true
}
```

`initAuth` llama a `authService.checkSession()` que hace GET `/api/auth/me`. Angular **no evalúa ninguna ruta ni guard hasta que el Promise del initializer se resuelve**. Si el servidor responde con el usuario, el signal se actualiza con ese usuario y `isLoggedIn()` devuelve `true`. Si falla (sesión vencida o no autenticado), el signal queda en `null`.

Resultado: cuando el guard de una ruta protegida se ejecuta, el signal ya refleja el estado real del servidor.

---

### 6.4 Componentes compartidos

#### RadarChart

Wrapper de Chart.js (versión 4) que renderiza un gráfico de tipo radar. Acepta dos inputs requeridos via la nueva API de signals (`input.required<T>()`):
- `labels: string[]` — nombres de las skills (ej: ["PAC", "SHO", "PAS", ...])
- `data: number[]` — valores numéricos de cada skill

Implementa `OnChanges` para actualizar el gráfico cuando los datos cambian (útil si el mismo componente se reusar para distintas versiones). El canvas se referencia con `@ViewChild` y se inicializa en `AfterViewInit`. Escala fija: 0-100, con pasos de 20.

#### SkillTimeline

Muestra la evolución de una skill seleccionada a lo largo del tiempo usando el componente `Timeline` de PrimeNG. Acepta:
- `idJugador: number` — ID de la tabla `Jugador` (no VersionJugador)
- `skills: Skill[]` — lista de skills disponibles para el dropdown

Cuando el usuario selecciona una skill, llama a `/api/jugador/:idJugador/evolucion?skillId=N` y renderiza la respuesta en la timeline. Maneja loading con signal.

#### Navbar

Barra de navegación con el nombre del usuario activo (leyendo el signal del `AuthService`) y botón de logout. Usa componentes `Toolbar` y `Button` de PrimeNG.

#### ConfirmDialog

Dialog de confirmación genérico con `@Input`/`@Output` tradicionales (no signals). Recibe `visible`, `message`, `header`, `confirmLabel`, `cancelLabel` y emite `onConfirm`, `onCancel`, `visibleChange`. Usa `DialogModule` y `ButtonModule` de PrimeNG.

#### LoadingSpinner

Componente de carga reutilizable sin inputs. Se incluye condicionalmente con `@if` cuando el signal `loading` es `true`.

---

### 6.5 Decisiones técnicas

#### Angular Zoneless Change Detection

La aplicación usa `provideZonelessChangeDetection()` en lugar de Zone.js. Esto significa que Angular no parchea las APIs del browser asíncronas. El cambio de estado debe notificarse explícitamente a través de signals o la infraestructura de RxJS. Esta decisión reduce el bundle size y mejora el rendimiento, pero requiere que todo el estado reactivo esté en signals o Observables.

#### Signals (Angular 20)

El proyecto usa extensivamente la API de signals:
- `signal<T>(initialValue)` para estado local mutable
- `computed(() => ...)` para valores derivados (ej: `calificacion` calculada desde los valores de skills)
- `input.required<T>()` para inputs de componentes en la nueva API
- `output<T>()` para eventos de componentes en la nueva API

Los guards usan `authService.isLoggedIn()` que internamente llama a `this.currentUser()` — la invocación del signal como función devuelve su valor actual de forma síncrona.

#### PrimeNG como librería de UI

Se usa PrimeNG con el preset de tema `Aura` y soporte de dark mode via selector `.dark-mode`. Los componentes utilizados incluyen: `Toolbar`, `Button`, `Dialog`, `Select`, `InputText`, `InputNumber`, `DatePicker`, `Checkbox`, `ToggleSwitch`, `Card`, `Message`, `Tag`, `Timeline`, `Toast`, `TableModule`. PrimeNG se integra nativamente con el sistema de temas de Angular Material Design y no requiere jQuery.

#### HTTP con fetch API

`provideHttpClient(withFetch())` configura `HttpClient` para usar la fetch API nativa del browser en lugar de XMLHttpRequest. Esto reduce el bundle y alínea el comportamiento con los estándares modernos.

#### Multipart Form Data para jugadores

La creación y edición de jugadores requiere subir una imagen opcional junto con los datos. Dado que no se puede mezclar JSON con archivos en la misma request de forma estándar, se usa `FormData`. Los campos complejos (`posiciones` y `skills`) se serializan como JSON strings y el backend los parsea en el middleware `parseMultipartBody`.

#### Lazy Loading de módulos

Las rutas de `auth` y `players` se cargan con `loadChildren()` como funciones de importación dinámica. Esto divide el bundle en chunks: el chunk de auth solo se carga cuando el usuario navega a `/auth`, y el de players solo cuando navega a `/players`. La pantalla de login es significativamente más liviana que la pantalla de listado.

#### takeUntilDestroyed para cleanup de Observables

Todos los componentes que suscriben Observables usan `takeUntilDestroyed(this.destroyRef)` donde `destroyRef = inject(DestroyRef)`. Esto cancela las suscripciones automáticamente cuando el componente se destruye, evitando memory leaks sin necesidad de implementar `OnDestroy`.

---

## 7. Nginx (Frontend)

El contenedor `frontend` sirve el build estático de Angular en el puerto 80 y actúa como proxy reverso para la API.

Configuraciones clave:
- `resolver 127.0.0.11 valid=30s` — resolución dinámica de DNS de Docker para el upstream `api`
- `proxy_buffering off` en `/api/` — desactiva el buffering de respuestas del proxy. Esto es crítico para que los endpoints SSE (como el streaming de IA) entreguen los tokens al browser en tiempo real sin que Nginx los acumule en buffer
- Todas las rutas no conocidas se redirigen a `index.html` (necesario para el routing SPA de Angular)
- Las imágenes estáticas se sirven directamente desde el contenedor de la API via el proxy `/img/`
