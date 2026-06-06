-- ============================================================
-- FIFA DATABASE - Script de creación completo
-- Motor: MySQL 8.0+
-- Encoding: utf8mb4
--
-- RESUMEN DE TABLAS:
--   1.  Nacionalidad              → catálogo de países
--   2.  Liga                      → ligas de fútbol por país
--   3.  Club                      → clubes por liga
--   4.  Posicion                  → catálogo de posiciones de juego
--   5.  Version                   → ediciones del juego FIFA 15 al 23
--   6.  Skill                     → catálogo de habilidades (campo/arquero)
--   7.  Usuario                   → usuarios del sistema (local + OAuth)
--   8.  Jugador                   → tabla maestra, identidad del jugador
--   9.  VersionJugador            → snapshot del jugador por edición
--   10. VersionJugadorPosicion    → posiciones del jugador por versión
--   11. VersionJugadorSkill       → valor de cada skill por versión
--
-- VISTAS:
--   vw_ListadoJugadores     → listado de cards para el front
--   vw_DetalleJugador       → detalle completo con skills por versión
--   vw_LineaDeTiempo        → evolución de skills año a año
--   vw_FiltrosDisponibles   → valores únicos para los filtros del front
--
-- DECISIONES DE DISEÑO CLAVE:
--   - Calificacion se almacena en VersionJugador y es calculada
--     por el BACKEND al crear o editar jugadores en una
--     transacción. Para carga masiva del CSV se usa un UPDATE
--     masivo al final. Esto evita triggers lentos.
--   - ImagenUrl vive en VersionJugador porque la imagen varía
--     por edición del juego.
--   - EsArquero fue removido de Posicion. La distinción entre
--     skills de campo y de arquero se maneja únicamente a través
--     de Skill.EsArquero. El backend detecta que GK = arquero.
--   - IdPosicion fue removido de VersionJugador. Las posiciones
--     se gestionan completamente a través de VersionJugadorPosicion
--     con el campo EsPrincipal para identificar la posición
--     principal. El listado del front filtra por EsPrincipal=TRUE.
--   - Usuario soporta autenticación local (Passport + JWT) y
--     OAuth (Google, GitHub). Pwd es NULLABLE para OAuth.
--     AuthProvider y ProviderId identifican el proveedor.
--   - EsDelJuegoBase distingue jugadores del CSV de los creados
--     por usuarios. Solo los creados por usuarios pueden
--     desactivarse (EsActivo = FALSE). El constraint chk_estado
--     lo garantiza a nivel de base de datos.
--   - EsRetirado + AnioRetiro registran el retiro del jugador
--     para mostrarlo en la línea de tiempo del front.
--   - La edad NO se almacena, se calcula desde FechaNacimiento
--     con TIMESTAMPDIFF para evitar datos desactualizados.
-- ============================================================

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

DROP DATABASE IF EXISTS fifa_db;
CREATE DATABASE fifa_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE fifa_db;

-- ============================================================
-- 1. NACIONALIDAD
-- Catálogo base de países del mundo.
-- Referenciada por Jugador (nacionalidad del jugador) y
-- por Liga (país al que pertenece la liga).
-- Usar un catálogo evita strings libres e inconsistentes
-- como "Argentina" / "argentina" / "ARG".
-- ============================================================
CREATE TABLE Nacionalidad (
    Id     INT          NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(100) NOT NULL,
    CONSTRAINT pk_nacionalidad        PRIMARY KEY (Id),
    CONSTRAINT uq_nacionalidad_nombre UNIQUE (Nombre)
);

-- ============================================================
-- 2. LIGA
-- Ligas de fútbol del mundo.
-- Cada liga pertenece a un país (IdNacionalidad).
-- Permite al front filtrar jugadores por liga y construir
-- la cadena Liga → Club → VersionJugador con JOINs simples.
-- ============================================================
CREATE TABLE Liga (
    Id              INT          NOT NULL AUTO_INCREMENT,
    Nombre          VARCHAR(100) NOT NULL,
    IdNacionalidad  INT          NOT NULL,
    CONSTRAINT pk_liga              PRIMARY KEY (Id),
    CONSTRAINT uq_liga_nombre       UNIQUE (Nombre),
    CONSTRAINT fk_liga_nacionalidad FOREIGN KEY (IdNacionalidad)
        REFERENCES Nacionalidad(Id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT  -- no se puede borrar un país si tiene ligas
);

-- ============================================================
-- 3. CLUB
-- Clubes de fútbol. Cada club pertenece a una liga.
-- IdLiga es NULLABLE porque algunos clubes del dataset
-- no tienen liga registrada (ej: Inter Miami de la MLS),
-- y los jugadores creados por usuarios pueden no tener
-- un club real asignado.
-- ============================================================
CREATE TABLE Club (
    Id      INT          NOT NULL AUTO_INCREMENT,
    Nombre  VARCHAR(100) NOT NULL,
    IdLiga  INT          NULL,
    CONSTRAINT pk_club        PRIMARY KEY (Id),
    CONSTRAINT uq_club_nombre UNIQUE (Nombre),
    CONSTRAINT fk_club_liga   FOREIGN KEY (IdLiga)
        REFERENCES Liga(Id)
        ON UPDATE CASCADE
        ON DELETE SET NULL  -- si se borra la liga el club queda con IdLiga NULL
);

-- ============================================================
-- 4. POSICION
-- Catálogo de posiciones de juego.
-- EsArquero fue removido: la distinción entre skills de campo
-- y de arquero se maneja únicamente por Skill.EsArquero.
-- El backend detecta que la posición GK implica cargar las
-- skills de arquero (DIV, HAN, KIC, REF, SPE, POS) en lugar
-- de las de campo (PAC, SHO, PAS, DRI, DEF, PHY).
-- ============================================================
CREATE TABLE Posicion (
    Id        INT         NOT NULL AUTO_INCREMENT,
    Nombre    VARCHAR(50) NOT NULL,
    CONSTRAINT pk_posicion        PRIMARY KEY (Id),
    CONSTRAINT uq_posicion_nombre UNIQUE (Nombre)
);

-- ============================================================
-- 5. VERSION
-- Ediciones del juego FIFA desde 2015 hasta 2023.
-- Centralizar el año en esta tabla evita tener un INT
-- suelto en VersionJugador sin validación ni nombre.
-- Permite agregar nuevas ediciones sin alterar estructura.
-- ============================================================
CREATE TABLE Version (
    Id     INT         NOT NULL AUTO_INCREMENT,
    Anio   INT         NOT NULL,
    Nombre VARCHAR(50) NOT NULL,
    CONSTRAINT pk_version        PRIMARY KEY (Id),
    CONSTRAINT uq_version_anio   UNIQUE (Anio),
    CONSTRAINT uq_version_nombre UNIQUE (Nombre)
);

-- ============================================================
-- 6. SKILL
-- Catálogo de todas las habilidades posibles del juego.
-- EsArquero distingue las skills de jugadores de campo
-- de las skills exclusivas de arqueros.
-- Esta tabla reemplaza las columnas fijas PAC, SHO, PAS,
-- DRI, DEF, PHY del diseño original y elimina la necesidad
-- de la tabla VersionArquero.
-- Si FIFA agrega nuevas skills en el futuro, solo se inserta
-- una fila acá sin alterar ninguna estructura existente.
-- ============================================================
CREATE TABLE Skill (
    Id        INT         NOT NULL AUTO_INCREMENT,
    Nombre    VARCHAR(50) NOT NULL,
    EsArquero BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_skill        PRIMARY KEY (Id),
    CONSTRAINT uq_skill_nombre UNIQUE (Nombre)
);

-- ============================================================
-- 7. USUARIO
-- Usuarios del sistema. Soporta tres métodos de auth:
--
--   LOCAL (Passport + JWT):
--     AuthProvider = 'local'
--     Pwd          = hash bcrypt de la contraseña
--     ProviderId   = NULL
--
--   GOOGLE OAuth:
--     AuthProvider = 'google'
--     Pwd          = NULL (no tiene contraseña propia)
--     ProviderId   = ID único que devuelve Google
--
--   GITHUB OAuth:
--     AuthProvider = 'github'
--     Pwd          = NULL (no tiene contraseña propia)
--     ProviderId   = ID único que devuelve GitHub
--
-- El constraint chk_auth garantiza la consistencia entre
-- estos campos directamente en la base de datos:
--   Si AuthProvider = 'local'  → Pwd obligatorio,
--                                 ProviderId debe ser NULL
--   Si AuthProvider != 'local' → ProviderId obligatorio,
--                                 Pwd debe ser NULL
--
-- La relación con Jugador es inversa: Jugador apunta hacia
-- Usuario mediante IdUsuarioCreador, lo que permite que un
-- usuario cree múltiples jugadores propios.
-- ============================================================
CREATE TABLE Usuario (
    Id             INT          NOT NULL AUTO_INCREMENT,
    Nombre         VARCHAR(100) NOT NULL,
    Apellido       VARCHAR(100) NOT NULL,
    NombreUsuario  VARCHAR(50)  NOT NULL,
    Email          VARCHAR(150) NOT NULL,
    Pwd            VARCHAR(255) NULL,         -- NULL para usuarios OAuth
    AuthProvider   VARCHAR(50)  NOT NULL DEFAULT 'local', -- 'local','google','github'
    ProviderId     VARCHAR(255) NULL,         -- ID del proveedor OAuth, NULL para local
    CONSTRAINT pk_usuario               PRIMARY KEY (Id),
    CONSTRAINT uq_usuario_nombreusuario UNIQUE (NombreUsuario),
    CONSTRAINT uq_usuario_email         UNIQUE (Email),

    -- Consistencia entre método de autenticación y credenciales:
    -- local  → Pwd obligatorio, ProviderId NULL
    -- OAuth  → ProviderId obligatorio, Pwd NULL
    CONSTRAINT chk_auth CHECK (
        (AuthProvider = 'local'  AND Pwd IS NOT NULL        AND ProviderId IS NULL) OR
        (AuthProvider != 'local' AND ProviderId IS NOT NULL AND Pwd IS NULL)
    )
);

-- ============================================================
-- 8. JUGADOR
-- Tabla maestra. Solo almacena datos de identidad que no
-- cambian a lo largo de las versiones del juego.
-- Todo lo que varía por edición vive en VersionJugador,
-- VersionJugadorPosicion y VersionJugadorSkill.
--
-- CAMPOS IMPORTANTES:
--
--   FechaNacimiento
--     La edad NO se almacena, se calcula en cada query:
--       TIMESTAMPDIFF(YEAR, FechaNacimiento, CURDATE())
--     Es NULLABLE porque datos del CSV pueden no tenerla.
--
--   EsDelJuegoBase
--     TRUE  = importado del CSV, no puede desactivarse
--     FALSE = creado por un usuario, puede desactivarse
--     El constraint chk_estado lo garantiza a nivel DB.
--
--   EsActivo
--     TRUE  = visible en el sistema (valor por defecto)
--     FALSE = eliminado lógicamente (solo jugadores creados)
--     NUNCA se borra físicamente un jugador de la DB.
--
--   EsRetirado + AnioRetiro
--     Si EsRetirado = TRUE  → AnioRetiro debe tener valor
--     Si EsRetirado = FALSE → AnioRetiro debe ser NULL
--     El constraint chk_retiro garantiza esta consistencia.
--
--   IdUsuarioCreador
--     NULL  = viene del CSV (EsDelJuegoBase = TRUE)
--     valor = usuario que lo creó (EsDelJuegoBase = FALSE)
-- ============================================================
CREATE TABLE Jugador (
    Id                INT          NOT NULL AUTO_INCREMENT,
    Nombre            VARCHAR(100) NOT NULL,
    Apellido          VARCHAR(100) NOT NULL,
    FechaNacimiento   DATE         NULL,
    EsHombre          BOOLEAN      NOT NULL,
    EsRetirado        BOOLEAN      NOT NULL DEFAULT FALSE,
    AnioRetiro        INT          NULL,
    EsDelJuegoBase    BOOLEAN      NOT NULL DEFAULT FALSE,
    EsActivo          BOOLEAN      NOT NULL DEFAULT TRUE,
    IdNacionalidad    INT          NOT NULL,
    IdUsuarioCreador  INT          NULL,
    CONSTRAINT pk_jugador PRIMARY KEY (Id),

    -- EsRetirado y AnioRetiro deben ser consistentes entre sí
    CONSTRAINT chk_retiro CHECK (
        (EsRetirado = FALSE AND AnioRetiro IS NULL    ) OR
        (EsRetirado = TRUE  AND AnioRetiro IS NOT NULL)
    ),

    -- Un jugador del juego base NUNCA puede estar inactivo
    CONSTRAINT chk_estado CHECK (
        EsDelJuegoBase = FALSE OR EsActivo = TRUE
    ),

    CONSTRAINT fk_jugador_nacionalidad FOREIGN KEY (IdNacionalidad)
        REFERENCES Nacionalidad(Id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_jugador_usuario FOREIGN KEY (IdUsuarioCreador)
        REFERENCES Usuario(Id)
        ON UPDATE CASCADE
        ON DELETE SET NULL  -- si se borra el usuario el jugador queda sin creador
);

-- ============================================================
-- 9. VERSION JUGADOR
-- Tabla detalle. Cada fila es un snapshot del jugador en
-- una edición específica del juego.
-- IdPosicion fue removido: las posiciones se gestionan
-- completamente en VersionJugadorPosicion.
--
-- CAMPOS IMPORTANTES:
--
--   ImagenUrl
--     URL de la foto del jugador en esa versión específica.
--     Vive acá y no en Jugador porque varía por edición.
--     Es NULLABLE para jugadores sin imagen asignada.
--
--   Calificacion
--     Promedio de las skills del jugador en esa versión.
--     Se almacena para que el listado del front sea rápido:
--     sin AVG, sin GROUP BY, sin JOIN extra.
--     El BACKEND la calcula y actualiza en transacción junto
--     con las skills. Para el CSV se usa un UPDATE masivo.
--
--   UNIQUE (IdJugador, IdVersion)
--     Un jugador no puede tener dos registros en el mismo año.
-- ============================================================
CREATE TABLE VersionJugador (
    Id            INT          NOT NULL AUTO_INCREMENT,
    IdJugador     INT          NOT NULL,
    IdVersion     INT          NOT NULL,
    IdClub        INT          NOT NULL,
    ImagenPath VARCHAR(500) NULL,
    Calificacion  INT          NOT NULL DEFAULT 0,
    CONSTRAINT pk_versionjugador                 PRIMARY KEY (Id),
    CONSTRAINT uq_versionjugador_jugador_version UNIQUE (IdJugador, IdVersion),
    CONSTRAINT chk_versionjugador_calificacion   CHECK (Calificacion BETWEEN 0 AND 99),

    CONSTRAINT fk_versionjugador_jugador FOREIGN KEY (IdJugador)
        REFERENCES Jugador(Id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,   -- si se borra el jugador se borran sus versiones

    CONSTRAINT fk_versionjugador_version FOREIGN KEY (IdVersion)
        REFERENCES Version(Id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,  -- no se puede borrar una versión con jugadores

    CONSTRAINT fk_versionjugador_club FOREIGN KEY (IdClub)
        REFERENCES Club(Id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT   -- no se puede borrar un club con jugadores
);

-- ============================================================
-- 10. VERSION JUGADOR POSICION
-- Tabla intermedia que resuelve la relación muchos a muchos
-- entre VersionJugador y Posicion.
-- Un jugador puede tener varias posiciones en una versión
-- (ej: Messi puede jugar CF y RW en FIFA 15).
--
-- EsPrincipal identifica la posición principal del jugador
-- en esa versión. Las vistas filtran por EsPrincipal = TRUE
-- para mostrar una sola posición en el listado del front.
--
-- NOTA SOBRE LA UNICIDAD DE POSICIÓN PRINCIPAL:
-- El constraint uq_principal garantiza que no existan dos
-- filas con EsPrincipal = TRUE para el mismo IdVersionJugador.
-- Se implementa con un índice único que solo incluye las filas
-- donde EsPrincipal = TRUE, lo cual es más preciso que un
-- UNIQUE compuesto que en MySQL no funciona correctamente con
-- booleanos porque permite múltiples NULL o FALSE.
-- ============================================================
CREATE TABLE VersionJugadorPosicion (
    IdVersionJugador  INT     NOT NULL,
    IdPosicion        INT     NOT NULL,
    EsPrincipal       BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_versionjugadorposicion PRIMARY KEY (IdVersionJugador, IdPosicion),

    CONSTRAINT fk_vjposicion_versionjugador FOREIGN KEY (IdVersionJugador)
        REFERENCES VersionJugador(Id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,  -- si se borra la versión se borran sus posiciones

    CONSTRAINT fk_vjposicion_posicion FOREIGN KEY (IdPosicion)
        REFERENCES Posicion(Id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT  -- no se puede borrar una posición en uso
);

-- Índice único parcial sobre EsPrincipal = TRUE:
-- Garantiza que solo haya UNA posición principal por versión.
-- Solo existe en MySQL 8+ usando una expresión en el índice.
CREATE UNIQUE INDEX uq_versionjugador_principal
    ON VersionJugadorPosicion ((
        CASE WHEN EsPrincipal = TRUE THEN IdVersionJugador ELSE NULL END
    ));

-- ============================================================
-- 11. VERSION JUGADOR SKILL
-- Tabla pivot. Mayor volumen de registros del sistema:
--   ~18.000 jugadores × 9 versiones × 6 skills = ~972.000 filas
--
-- PK compuesta (IdVersionJugador, IdSkill) cumple dos roles:
--   1. UNICIDAD: garantiza que no exista dos veces la misma
--      skill para la misma versión de un jugador.
--   2. ÍNDICE: MySQL genera un índice automático sobre la PK
--      compuesta, haciendo muy rápida la búsqueda por
--      IdVersionJugador (primer campo de la PK).
--
-- Reemplaza las columnas fijas PAC, SHO, PAS, DRI, DEF, PHY
-- y elimina la necesidad de la tabla VersionArquero.
-- ============================================================
CREATE TABLE VersionJugadorSkill (
    IdVersionJugador  INT NOT NULL,
    IdSkill           INT NOT NULL,
    Valor             INT NOT NULL,
    CONSTRAINT pk_versionjugadorskill        PRIMARY KEY (IdVersionJugador, IdSkill),
    CONSTRAINT chk_versionjugadorskill_valor CHECK (Valor BETWEEN 0 AND 99),

    CONSTRAINT fk_versionjugadorskill_version FOREIGN KEY (IdVersionJugador)
        REFERENCES VersionJugador(Id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,  -- si se borra la versión se borran sus skills

    CONSTRAINT fk_versionjugadorskill_skill FOREIGN KEY (IdSkill)
        REFERENCES Skill(Id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT  -- no se puede borrar una skill con valores cargados
);

-- ============================================================
-- ÍNDICES ADICIONALES
-- Los índices sobre FK se crean automáticamente en MySQL.
-- Se agregan índices extra para las queries más frecuentes.
-- ============================================================

-- Filtrar versiones por edición del juego
CREATE INDEX idx_versionjugador_idversion     ON VersionJugador(IdVersion);

-- Filtrar jugadores por club en el listado del front
CREATE INDEX idx_versionjugador_idclub        ON VersionJugador(IdClub);

-- ORDER BY calificación (el más usado en el listado del front)
CREATE INDEX idx_versionjugador_calificacion  ON VersionJugador(Calificacion);

-- Filtrar por posición en el listado del front
CREATE INDEX idx_vjposicion_idposicion        ON VersionJugadorPosicion(IdPosicion);

-- Filtrar solo posición principal rápidamente
CREATE INDEX idx_vjposicion_esprincipal       ON VersionJugadorPosicion(EsPrincipal);

-- Buscar skills de una versión (detalle + radar chart)
CREATE INDEX idx_versionjugadorskill_idvj     ON VersionJugadorSkill(IdVersionJugador);

-- Listado de jugadores activos (el filtro más común del front)
CREATE INDEX idx_jugador_esactivo             ON Jugador(EsActivo);

-- Distinguir jugadores del CSV vs creados por usuarios
CREATE INDEX idx_jugador_esdeljuegobase       ON Jugador(EsDelJuegoBase);

-- Filtrar jugadores retirados para la línea de tiempo
CREATE INDEX idx_jugador_esretirado           ON Jugador(EsRetirado);

-- Buscar clubes de una liga específica
CREATE INDEX idx_club_idliga                  ON Club(IdLiga);

-- Buscar ligas de un país específico
CREATE INDEX idx_liga_idnacionalidad          ON Liga(IdNacionalidad);

-- Buscar usuario por proveedor OAuth (usado por Passport)
CREATE INDEX idx_usuario_authprovider         ON Usuario(AuthProvider);
CREATE INDEX idx_usuario_providerid           ON Usuario(ProviderId);

-- ============================================================
-- VISTAS
-- Encapsulan las queries más complejas para que el backend
-- las consuma como si fueran tablas simples.
-- ============================================================

-- ------------------------------------------------------------
-- VISTA 1: vw_ListadoJugadores
-- ------------------------------------------------------------
CREATE VIEW vw_ListadoJugadores AS
SELECT
    vj.Id AS IdVersionJugador,
    j.Id AS IdJugador,
    vj.IdVersion,
    j.EsHombre,
    j.IdUsuarioCreador,
    j.EsDelJuegoBase,
    v.Nombre AS Juego,
    vj.ImagenPath AS Foto,
    j.Nombre,
    j.Apellido,
    n.Nombre AS Nacionalidad,
    c.Nombre AS Club,
    p.Nombre AS PosicionPrincipal,
    vj.Calificacion
FROM VersionJugador vj
INNER JOIN Jugador j ON vj.IdJugador = j.Id
INNER JOIN Nacionalidad n ON j.IdNacionalidad = n.Id
INNER JOIN Version v ON vj.IdVersion = v.Id
INNER JOIN Club c ON vj.IdClub = c.Id
LEFT JOIN VersionJugadorPosicion vjp ON vj.Id = vjp.IdVersionJugador AND vjp.EsPrincipal = 1
LEFT JOIN Posicion p ON vjp.IdPosicion = p.Id;


-- ------------------------------------------------------------
-- VISTA 2: vw_DetalleJugador
-- ------------------------------------------------------------
CREATE VIEW vw_DetalleJugador AS
SELECT
    vj.Id AS IdVersionJugador,
    j.Id AS IdJugador,
    v.Nombre AS Juego,
    j.Nombre AS Nombre,
    j.Apellido AS Apellido,
    j.IdNacionalidad AS IdNacionalidad,
    n.Nombre AS Nacionalidad,
    vj.IdClub AS IdClub,
    c.Nombre AS Club,
    c.IdLiga AS IdLiga,
    vj.ImagenPath AS ImagenUrl,
    vjs.IdSkill AS IdSkill,
    s.Nombre AS Skill,
    vjs.Valor AS ValorSkill,
    vj.Calificacion AS Calificacion
FROM VersionJugador vj
INNER JOIN Jugador j ON vj.IdJugador = j.Id
INNER JOIN Nacionalidad n ON j.IdNacionalidad = n.Id
INNER JOIN Version v ON vj.IdVersion = v.Id
INNER JOIN Club c ON vj.IdClub = c.Id
INNER JOIN VersionJugadorSkill vjs ON vj.Id = vjs.IdVersionJugador
INNER JOIN Skill s ON vjs.IdSkill = s.Id;

-- ------------------------------------------------------------
-- VISTA 3: vw_LineaDeTiempo
-- Para la pantalla de línea de tiempo del front.
-- Devuelve la evolución de todas las skills de un jugador
-- a lo largo de los años, incluyendo datos de retiro.
-- ------------------------------------------------------------
CREATE VIEW vw_EvolucionSkillJugador AS
SELECT 
    j.Id AS IdJugador,
    j.Nombre,
    j.Apellido,
    s.Id AS IdSkill,
    s.Nombre AS Skill,
    v.Anio AS AnioJuego,
    v.Nombre AS Juego,
    vjs.Valor AS ValorSkill
FROM 
    Jugador j
INNER JOIN 
    VersionJugador vj ON j.Id = vj.IdJugador
INNER JOIN 
    Version v ON vj.IdVersion = v.Id
INNER JOIN 
    VersionJugadorSkill vjs ON vj.Id = vjs.IdVersionJugador
INNER JOIN 
    Skill s ON vjs.IdSkill = s.Id;

-- ============================================================
-- DATOS SEMILLA — Catálogos base
-- Se cargan una sola vez. Son estables y no cambian.
-- Los jugadores se importan luego desde el CSV.
-- ============================================================

-- 30 nacionalidades (las más comunes en el dataset FIFA)
INSERT INTO Nacionalidad (Nombre) VALUES
('Argentina'),     -- Id 1
('Brasil'),        -- Id 2
('España'),        -- Id 3
('Inglaterra'),    -- Id 4
('Italia'),        -- Id 5
('Francia'),       -- Id 6
('Alemania'),      -- Id 7
('Portugal'),      -- Id 8
('Países Bajos'),  -- Id 9
('Bélgica'),       -- Id 10
('Uruguay'),       -- Id 11
('Colombia'),      -- Id 12
('Chile'),         -- Id 13
('México'),        -- Id 14
('Australia'),     -- Id 15
('Japón'),         -- Id 16
('Corea del Sur'), -- Id 17
('Senegal'),       -- Id 18
('Nigeria'),       -- Id 19
('Marruecos'),     -- Id 20
('Croacia'),       -- Id 21
('Dinamarca'),     -- Id 22
('Suecia'),        -- Id 23
('Polonia'),       -- Id 24
('Serbia'),        -- Id 25
('Austria'),       -- Id 26
('Suiza'),         -- Id 27
('Escocia'),       -- Id 28
('Gales'),         -- Id 29
('Irlanda');       -- Id 30

-- 10 ligas principales del dataset FIFA
INSERT INTO Liga (Nombre, IdNacionalidad) VALUES
('La Liga',          3),   -- Id 1,  España
('Premier League',   4),   -- Id 2,  Inglaterra
('Serie A',          5),   -- Id 3,  Italia
('Ligue 1',          6),   -- Id 4,  Francia
('Bundesliga',       7),   -- Id 5,  Alemania
('Eredivisie',       9),   -- Id 6,  Países Bajos
('Liga Profesional', 1),   -- Id 7,  Argentina
('Brasileirao',      2),   -- Id 8,  Brasil
('Primeira Liga',    8),   -- Id 9,  Portugal
('Pro League',       10);  -- Id 10, Bélgica

-- 25 clubes representativos del dataset
-- IdLiga NULL = liga no registrada en FIFA (ej: MLS, Saudi Pro League)
INSERT INTO Club (Nombre, IdLiga) VALUES
('FC Barcelona',        1),   -- Id 1
('Real Madrid',         1),   -- Id 2
('Atlético de Madrid',  1),   -- Id 3
('Sevilla FC',          1),   -- Id 4
('Manchester City',     2),   -- Id 5
('Liverpool',           2),   -- Id 6
('Chelsea',             2),   -- Id 7
('Arsenal',             2),   -- Id 8
('Manchester United',   2),   -- Id 9
('Tottenham',           2),   -- Id 10
('Inter de Milán',      3),   -- Id 11
('AC Milan',            3),   -- Id 12
('Juventus',            3),   -- Id 13
('AS Roma',             3),   -- Id 14
('Paris Saint-Germain', 4),   -- Id 15
('Olympique de Lyon',   4),   -- Id 16
('Bayern Munich',       5),   -- Id 17
('Borussia Dortmund',   5),   -- Id 18
('Ajax',                6),   -- Id 19
('PSV Eindhoven',       6),   -- Id 20
('Benfica',             9),   -- Id 21
('Porto',               9),   -- Id 22
('Sporting CP',         9),   -- Id 23
('Inter Miami',         NULL),-- Id 24, MLS no registrada en FIFA
('Al Nassr',            NULL);-- Id 25, Saudi Pro League no registrada

-- 13 posiciones de juego (sin EsArquero: se maneja por Skill)
INSERT INTO Posicion (Nombre) VALUES
('GK'),   -- Id 1,  Arquero
('CB'),   -- Id 2,  Defensor central
('LB'),   -- Id 3,  Lateral izquierdo
('RB'),   -- Id 4,  Lateral derecho
('CDM'),  -- Id 5,  Mediocampista defensivo
('CM'),   -- Id 6,  Mediocampista central
('CAM'),  -- Id 7,  Mediocampista ofensivo
('LM'),   -- Id 8,  Mediocampista izquierdo
('RM'),   -- Id 9,  Mediocampista derecho
('LW'),   -- Id 10, Extremo izquierdo
('RW'),   -- Id 11, Extremo derecho
('CF'),   -- Id 12, Centrofoward
('ST');   -- Id 13, Delantero centro

-- 9 ediciones del juego FIFA
INSERT INTO Version (Anio, Nombre) VALUES
(2015, 'FIFA 15'), -- Id 1
(2016, 'FIFA 16'), -- Id 2
(2017, 'FIFA 17'), -- Id 3
(2018, 'FIFA 18'), -- Id 4
(2019, 'FIFA 19'), -- Id 5
(2020, 'FIFA 20'), -- Id 6
(2021, 'FIFA 21'), -- Id 7
(2022, 'FIFA 22'), -- Id 8
(2023, 'EA FC 2023'); -- Id 9

-- Skills de jugadores de campo (EsArquero = FALSE)
-- El backend carga estas cuando la posición principal != GK
INSERT INTO Skill (Nombre, EsArquero) VALUES
('PAC', FALSE),  -- Id 1,  Velocidad / Pace
('SHO', FALSE),  -- Id 2,  Disparo / Shooting
('PAS', FALSE),  -- Id 3,  Pase / Passing
('DRI', FALSE),  -- Id 4,  Regate / Dribbling
('DEF', FALSE),  -- Id 5,  Defensa / Defending
('PHY', FALSE);  -- Id 6,  Físico / Physicality

-- Skills exclusivas de arqueros (EsArquero = TRUE)
-- El backend carga estas cuando la posición principal = GK
INSERT INTO Skill (Nombre, EsArquero) VALUES
('DIV', TRUE),  -- Id 7,  Estiramiento / Diving
('HAN', TRUE),  -- Id 8,  Manejo / Handling
('KIC', TRUE),  -- Id 9,  Patada / Kicking
('REF', TRUE),  -- Id 10, Reflejos / Reflexes
('SPE', TRUE),  -- Id 11, Velocidad / Speed
('POS', TRUE);  -- Id 12, Posicionamiento / Positioning

-- ============================================================
-- JUGADORES DE EJEMPLO
-- 6 jugadores que cubren todos los casos de uso del sistema:
--
--   Id 1 - Lionel Messi       → activo,          hombre, CSV
--   Id 2 - Neymar Jr          → activo,          hombre, CSV
--   Id 3 - Francesco Totti    → retirado (2017), hombre, CSV
--   Id 4 - Javier Mascherano  → retirado (2020), hombre, CSV
--   Id 5 - Alexia Putellas    → activa,          mujer,  CSV
--   Id 6 - Sam Kerr           → activa,          mujer,  CSV
-- ============================================================
INSERT INTO Jugador
    (Nombre, Apellido, FechaNacimiento, EsHombre, EsRetirado, AnioRetiro, EsDelJuegoBase, EsActivo, IdNacionalidad, IdUsuarioCreador)
VALUES
('Lionel',    'Messi',      '1987-06-24', TRUE,  FALSE, NULL, TRUE, TRUE,  1,  NULL), -- Id 1
('Neymar',    'Jr',         '1992-02-05', TRUE,  FALSE, NULL, TRUE, TRUE,  2,  NULL), -- Id 2
('Francesco', 'Totti',      '1976-09-27', TRUE,  TRUE,  2017, TRUE, TRUE,  5,  NULL), -- Id 3
('Javier',    'Mascherano', '1984-06-08', TRUE,  TRUE,  2020, TRUE, TRUE,  1,  NULL), -- Id 4
('Alexia',    'Putellas',   '1994-02-04', FALSE, FALSE, NULL, TRUE, TRUE,  3,  NULL), -- Id 5
('Sam',       'Kerr',       '1993-09-10', FALSE, FALSE, NULL, TRUE, TRUE,  15, NULL); -- Id 6

-- ============================================================
-- VERSIONES DE JUGADORES
-- Orden de inserción:
--   1. VersionJugador (datos base sin posición)
--   2. VersionJugadorPosicion (posiciones con EsPrincipal)
--   3. VersionJugadorSkill (skills con valores)
--   4. UPDATE Calificacion (promedio calculado)
--
-- Los IDs de VersionJugador se asignan en orden de inserción:
--   Messi        → VJ 1  al VJ 9  (FIFA 15 al 23, 9 versiones)
--   Neymar       → VJ 10 al VJ 18 (FIFA 15 al 23, 9 versiones)
--   Totti        → VJ 19 al VJ 21 (FIFA 15 al 17, 3 versiones)
--   Mascherano   → VJ 22 al VJ 27 (FIFA 15 al 20, 6 versiones)
--   Putellas     → VJ 28 al VJ 35 (FIFA 16 al 23, 8 versiones)
--   Sam Kerr     → VJ 36 al VJ 41 (FIFA 18 al 23, 6 versiones)
-- ============================================================

-- ============================================================
-- MESSI (IdJugador = 1)
-- Pasó de Barcelona → PSG (FIFA 21) → Inter Miami (FIFA 23)
-- Cambió de CF/RW a solo RW a lo largo de los años
-- ============================================================
INSERT INTO VersionJugador (IdJugador, IdVersion, IdClub, ImagenPath, Calificacion) VALUES
(1, 1, 1,  '/img/messi2015.webp', 0), -- VJ 1:  FIFA 15, Barcelona
(1, 2, 1,  '/img/messi2016.webp', 0), -- VJ 2:  FIFA 16, Barcelona
(1, 3, 1,  '/img/messi2017.webp', 0), -- VJ 3:  FIFA 17, Barcelona
(1, 4, 1,  '/img/messi2018.webp', 0), -- VJ 4:  FIFA 18, Barcelona
(1, 5, 1,  '/img/messi2019.webp', 0), -- VJ 5:  FIFA 19, Barcelona
(1, 6, 1,  '/img/messi2020.webp', 0), -- VJ 6:  FIFA 20, Barcelona
(1, 7, 15, '/img/messi2021.webp', 0), -- VJ 7:  FIFA 21, PSG
(1, 8, 15, '/img/messi2022.webp', 0), -- VJ 8:  FIFA 22, PSG
(1, 9, 24, '/img/messi2023.webp', 0); -- VJ 9:  FIFA 23, Inter Miami

-- Posiciones Messi: CF principal + RW alternativa (FIFA 15-16)
--                   RW principal + CF alternativa (FIFA 17-23)
INSERT INTO VersionJugadorPosicion (IdVersionJugador, IdPosicion, EsPrincipal) VALUES
(1,  12, TRUE ),  (1,  11, FALSE),   -- FIFA 15: CF principal
(2,  12, TRUE ),  (2,  11, FALSE),   -- FIFA 16: CF principal
(3,  11, TRUE ),  (3,  12, FALSE),   -- FIFA 17: RW principal
(4,  11, TRUE ),  (4,  12, FALSE),   -- FIFA 18: RW principal
(5,  11, TRUE ),  (5,  12, FALSE),   -- FIFA 19: RW principal
(6,  11, TRUE ),  (6,  12, FALSE),   -- FIFA 20: RW principal
(7,  11, TRUE ),  (7,  12, FALSE),   -- FIFA 21: RW principal
(8,  11, TRUE ),  (8,  12, FALSE),   -- FIFA 22: RW principal
(9,  11, TRUE ),  (9,  12, FALSE);   -- FIFA 23: RW principal

-- Skills Messi + UPDATE de Calificacion
-- FIFA 15 (VJ 1) → AVG(97,96,94,99,41,74) = 83.5 → 84
INSERT INTO VersionJugadorSkill VALUES (1,1,97),(1,2,96),(1,3,94),(1,4,99),(1,5,41),(1,6,74);
UPDATE VersionJugador SET Calificacion = 84 WHERE Id = 1;
-- FIFA 16 (VJ 2) → AVG(96,95,90,98,40,72) = 81.8 → 82
INSERT INTO VersionJugadorSkill VALUES (2,1,96),(2,2,95),(2,3,90),(2,4,98),(2,5,40),(2,6,72);
UPDATE VersionJugador SET Calificacion = 82 WHERE Id = 2;
-- FIFA 17 (VJ 3) → AVG(97,99,97,99,45,80) = 86.2 → 86
INSERT INTO VersionJugadorSkill VALUES (3,1,97),(3,2,99),(3,3,97),(3,4,99),(3,5,45),(3,6,80);
UPDATE VersionJugador SET Calificacion = 86 WHERE Id = 3;
-- FIFA 18 (VJ 4) → AVG(96,97,98,99,45,81) = 86.0 → 86
INSERT INTO VersionJugadorSkill VALUES (4,1,96),(4,2,97),(4,3,98),(4,4,99),(4,5,45),(4,6,81);
UPDATE VersionJugador SET Calificacion = 86 WHERE Id = 4;
-- FIFA 19 (VJ 5) → AVG(90,95,93,97,42,78) = 82.5 → 83
INSERT INTO VersionJugadorSkill VALUES (5,1,90),(5,2,95),(5,3,93),(5,4,97),(5,5,42),(5,6,78);
UPDATE VersionJugador SET Calificacion = 83 WHERE Id = 5;
-- FIFA 20 (VJ 6) → AVG(89,94,92,96,41,77) = 81.5 → 82
INSERT INTO VersionJugadorSkill VALUES (6,1,89),(6,2,94),(6,3,92),(6,4,96),(6,5,41),(6,6,77);
UPDATE VersionJugador SET Calificacion = 82 WHERE Id = 6;
-- FIFA 21 (VJ 7) → AVG(88,93,92,96,40,76) = 80.8 → 81
INSERT INTO VersionJugadorSkill VALUES (7,1,88),(7,2,93),(7,3,92),(7,4,96),(7,5,40),(7,6,76);
UPDATE VersionJugador SET Calificacion = 81 WHERE Id = 7;
-- FIFA 22 (VJ 8) → AVG(86,92,91,95,38,75) = 79.5 → 80
INSERT INTO VersionJugadorSkill VALUES (8,1,86),(8,2,92),(8,3,91),(8,4,95),(8,5,38),(8,6,75);
UPDATE VersionJugador SET Calificacion = 80 WHERE Id = 8;
-- FIFA 23 (VJ 9) → AVG(85,92,91,95,35,65) = 77.2 → 77
INSERT INTO VersionJugadorSkill VALUES (9,1,85),(9,2,92),(9,3,91),(9,4,95),(9,5,35),(9,6,65);
UPDATE VersionJugador SET Calificacion = 77 WHERE Id = 9;

-- ============================================================
-- NEYMAR (IdJugador = 2)
-- Barcelona → PSG (FIFA 18) → Al Nassr (FIFA 23)
-- Siempre LW principal con ST como alternativa
-- ============================================================
INSERT INTO VersionJugador (IdJugador, IdVersion, IdClub, ImagenPath, Calificacion) VALUES
(2, 1, 1,  '/img/neymar2015.webp', 0), -- VJ 10: FIFA 15, Barcelona
(2, 2, 1,  '/img/neymar2016.webp', 0), -- VJ 11: FIFA 16, Barcelona
(2, 3, 1,  '/img/neymar2017.webp', 0), -- VJ 12: FIFA 17, Barcelona
(2, 4, 15, '/img/neymar2018.webp', 0), -- VJ 13: FIFA 18, PSG
(2, 5, 15, '/img/neymar2019.webp', 0), -- VJ 14: FIFA 19, PSG
(2, 6, 15, '/img/neymar2020.webp', 0), -- VJ 15: FIFA 20, PSG
(2, 7, 15, '/img/neymar2021.webp', 0), -- VJ 16: FIFA 21, PSG
(2, 8, 15, '/img/neymar2022.webp', 0), -- VJ 17: FIFA 22, PSG
(2, 9, 25, '/img/neymar2023.webp', 0); -- VJ 18: FIFA 23, Al Nassr

-- Posiciones Neymar: LW principal + ST alternativa (todas las versiones)
INSERT INTO VersionJugadorPosicion (IdVersionJugador, IdPosicion, EsPrincipal) VALUES
(10, 10, TRUE),(10, 13, FALSE),
(11, 10, TRUE),(11, 13, FALSE),
(12, 10, TRUE),(12, 13, FALSE),
(13, 10, TRUE),(13, 13, FALSE),
(14, 10, TRUE),(14, 13, FALSE),
(15, 10, TRUE),(15, 13, FALSE),
(16, 10, TRUE),(16, 13, FALSE),
(17, 10, TRUE),(17, 13, FALSE),
(18, 10, TRUE),(18, 13, FALSE);

-- Skills Neymar + UPDATE de Calificacion (9 versiones completas)
-- FIFA 15 (VJ 10) → AVG(92,87,81,96,30,60) = 74.3 → 74
INSERT INTO VersionJugadorSkill VALUES (10,1,92),(10,2,87),(10,3,81),(10,4,96),(10,5,30),(10,6,60);
UPDATE VersionJugador SET Calificacion = 74 WHERE Id = 10;
-- FIFA 16 (VJ 11) → AVG(93,87,81,96,31,61) = 74.8 → 75
INSERT INTO VersionJugadorSkill VALUES (11,1,93),(11,2,87),(11,3,81),(11,4,96),(11,5,31),(11,6,61);
UPDATE VersionJugador SET Calificacion = 75 WHERE Id = 11;
-- FIFA 17 (VJ 12) → AVG(94,87,82,97,32,62) = 75.7 → 76
INSERT INTO VersionJugadorSkill VALUES (12,1,94),(12,2,87),(12,3,82),(12,4,97),(12,5,32),(12,6,62);
UPDATE VersionJugador SET Calificacion = 76 WHERE Id = 12;
-- FIFA 18 (VJ 13) → AVG(93,86,83,97,33,62) = 75.7 → 76
INSERT INTO VersionJugadorSkill VALUES (13,1,93),(13,2,86),(13,3,83),(13,4,97),(13,5,33),(13,6,62);
UPDATE VersionJugador SET Calificacion = 76 WHERE Id = 13;
-- FIFA 19 (VJ 14) → AVG(91,85,84,97,33,63) = 75.5 → 76
INSERT INTO VersionJugadorSkill VALUES (14,1,91),(14,2,85),(14,3,84),(14,4,97),(14,5,33),(14,6,63);
UPDATE VersionJugador SET Calificacion = 76 WHERE Id = 14;
-- FIFA 20 (VJ 15) → AVG(91,84,84,96,33,63) = 75.2 → 75
INSERT INTO VersionJugadorSkill VALUES (15,1,91),(15,2,84),(15,3,84),(15,4,96),(15,5,33),(15,6,63);
UPDATE VersionJugador SET Calificacion = 75 WHERE Id = 15;
-- FIFA 21 (VJ 16) → AVG(90,83,84,95,33,63) = 74.7 → 75
INSERT INTO VersionJugadorSkill VALUES (16,1,90),(16,2,83),(16,3,84),(16,4,95),(16,5,33),(16,6,63);
UPDATE VersionJugador SET Calificacion = 75 WHERE Id = 16;
-- FIFA 22 (VJ 17) → AVG(89,83,83,95,32,62) = 74.0 → 74
INSERT INTO VersionJugadorSkill VALUES (17,1,89),(17,2,83),(17,3,83),(17,4,95),(17,5,32),(17,6,62);
UPDATE VersionJugador SET Calificacion = 74 WHERE Id = 17;
-- FIFA 23 (VJ 18) → AVG(88,83,83,95,32,60) = 73.5 → 74
INSERT INTO VersionJugadorSkill VALUES (18,1,88),(18,2,83),(18,3,83),(18,4,95),(18,5,32),(18,6,60);
UPDATE VersionJugador SET Calificacion = 74 WHERE Id = 18;

-- ============================================================
-- TOTTI (IdJugador = 3)
-- Solo 3 versiones: FIFA 15, 16 y 17 (se retiró en 2017)
-- Jugó toda su carrera en AS Roma como ST/CF
-- ============================================================
INSERT INTO VersionJugador (IdJugador, IdVersion, IdClub, ImagenPath, Calificacion) VALUES
(3, 1, 14, 'img/totti2015.webp', 0), -- VJ 19: FIFA 15, AS Roma
(3, 2, 14, 'img/totti2015.webp', 0), -- VJ 20: FIFA 16, AS Roma
(3, 3, 14, 'img/totti2015.webp', 0); -- VJ 21: FIFA 17, AS Roma (última)

-- Posiciones Totti: ST principal (FIFA 15-16), CF principal (FIFA 17)
INSERT INTO VersionJugadorPosicion (IdVersionJugador, IdPosicion, EsPrincipal) VALUES
(19, 13, TRUE),(19, 12, FALSE),   -- FIFA 15: ST principal
(20, 13, TRUE),(20, 12, FALSE),   -- FIFA 16: ST principal
(21, 12, TRUE),(21, 13, FALSE);   -- FIFA 17: CF principal (última versión)

-- Skills Totti + UPDATE de Calificacion
-- FIFA 15 (VJ 19) → AVG(70,82,84,85,42,72) = 72.5 → 73
INSERT INTO VersionJugadorSkill VALUES (19,1,70),(19,2,82),(19,3,84),(19,4,85),(19,5,42),(19,6,72);
UPDATE VersionJugador SET Calificacion = 73 WHERE Id = 19;
-- FIFA 16 (VJ 20) → AVG(67,80,83,84,40,71) = 70.8 → 71
INSERT INTO VersionJugadorSkill VALUES (20,1,67),(20,2,80),(20,3,83),(20,4,84),(20,5,40),(20,6,71);
UPDATE VersionJugador SET Calificacion = 71 WHERE Id = 20;
-- FIFA 17 (VJ 21) → AVG(63,76,81,82,38,70) = 68.3 → 68 (última versión)
INSERT INTO VersionJugadorSkill VALUES (21,1,63),(21,2,76),(21,3,81),(21,4,82),(21,5,38),(21,6,70);
UPDATE VersionJugador SET Calificacion = 68 WHERE Id = 21;

-- ============================================================
-- MASCHERANO (IdJugador = 4)
-- 6 versiones: FIFA 15 al 20 (se retiró en 2020)
-- Barcelona como CDM (FIFA 15-17) → CB (FIFA 18)
-- AS Roma (FIFA 19-20) hasta su retiro
-- ============================================================
INSERT INTO VersionJugador (IdJugador, IdVersion, IdClub, ImagenPath, Calificacion) VALUES
(4, 1, 1,  '/img/masche2015.webp', 0), -- VJ 22: FIFA 15, Barcelona
(4, 2, 1,  '/img/masche2016.webp', 0), -- VJ 23: FIFA 16, Barcelona
(4, 3, 1,  '/img/masche2017.webp', 0), -- VJ 24: FIFA 17, Barcelona
(4, 4, 1,  '/img/masche2018.webp', 0), -- VJ 25: FIFA 18, Barcelona
(4, 5, 14, '/img/masche2019.webp', 0), -- VJ 26: FIFA 19, AS Roma
(4, 6, 14, '/img/masche2020.webp', 0); -- VJ 27: FIFA 20, AS Roma (última)

-- Posiciones Mascherano: CDM+CB (FIFA 15-17) → CB+CDM (FIFA 18-20)
INSERT INTO VersionJugadorPosicion (IdVersionJugador, IdPosicion, EsPrincipal) VALUES
(22, 5, TRUE),(22, 2, FALSE),   -- FIFA 15: CDM principal
(23, 5, TRUE),(23, 2, FALSE),   -- FIFA 16: CDM principal
(24, 5, TRUE),(24, 2, FALSE),   -- FIFA 17: CDM principal
(25, 2, TRUE),(25, 5, FALSE),   -- FIFA 18: CB principal
(26, 2, TRUE),(26, 5, FALSE),   -- FIFA 19: CB principal
(27, 2, TRUE),(27, 5, FALSE);   -- FIFA 20: CB principal (última versión)

-- Skills Mascherano + UPDATE de Calificacion
-- FIFA 15 (VJ 22) → AVG(72,45,75,72,87,83) = 72.3 → 72
INSERT INTO VersionJugadorSkill VALUES (22,1,72),(22,2,45),(22,3,75),(22,4,72),(22,5,87),(22,6,83);
UPDATE VersionJugador SET Calificacion = 72 WHERE Id = 22;
-- FIFA 16 (VJ 23) → AVG(71,44,74,71,87,83) = 71.7 → 72
INSERT INTO VersionJugadorSkill VALUES (23,1,71),(23,2,44),(23,3,74),(23,4,71),(23,5,87),(23,6,83);
UPDATE VersionJugador SET Calificacion = 72 WHERE Id = 23;
-- FIFA 17 (VJ 24) → AVG(70,43,73,70,86,82) = 70.7 → 71
INSERT INTO VersionJugadorSkill VALUES (24,1,70),(24,2,43),(24,3,73),(24,4,70),(24,5,86),(24,6,82);
UPDATE VersionJugador SET Calificacion = 71 WHERE Id = 24;
-- FIFA 18 (VJ 25) → AVG(68,40,71,68,85,81) = 68.8 → 69
INSERT INTO VersionJugadorSkill VALUES (25,1,68),(25,2,40),(25,3,71),(25,4,68),(25,5,85),(25,6,81);
UPDATE VersionJugador SET Calificacion = 69 WHERE Id = 25;
-- FIFA 19 (VJ 26) → AVG(65,35,68,65,84,80) = 66.2 → 66
INSERT INTO VersionJugadorSkill VALUES (26,1,65),(26,2,35),(26,3,68),(26,4,65),(26,5,84),(26,6,80);
UPDATE VersionJugador SET Calificacion = 66 WHERE Id = 26;
-- FIFA 20 (VJ 27) → AVG(60,32,65,62,82,78) = 63.2 → 63 (última versión)
INSERT INTO VersionJugadorSkill VALUES (27,1,60),(27,2,32),(27,3,65),(27,4,62),(27,5,82),(27,6,78);
UPDATE VersionJugador SET Calificacion = 63 WHERE Id = 27;

-- ============================================================
-- ALEXIA PUTELLAS (IdJugador = 5)
-- 4 versiones: FIFA 20 al 23
-- FC Barcelona toda su carrera, posición CAM principal
-- ============================================================
INSERT INTO VersionJugador (IdJugador, IdVersion, IdClub, ImagenPath, Calificacion) VALUES
(5, 6, 1, '/img/alexia2020.webp', 0), -- VJ 28: FIFA 20, Barcelona
(5, 7, 1, '/img/alexia2021.webp', 0), -- VJ 29: FIFA 21, Barcelona
(5, 8, 1, '/img/alexia2022.webp', 0), -- VJ 30: FIFA 22, Barcelona
(5, 9, 1, '/img/alexia2023.webp', 0); -- VJ 31: FIFA 23, Barcelona

-- Posiciones Putellas: CAM principal + CM alternativa
INSERT INTO VersionJugadorPosicion (IdVersionJugador, IdPosicion, EsPrincipal) VALUES
(28, 7, TRUE),(28, 6, FALSE),
(29, 7, TRUE),(29, 6, FALSE),
(30, 7, TRUE),(30, 6, FALSE),
(31, 7, TRUE),(31, 6, FALSE);

-- Skills Putellas + UPDATE de Calificacion
-- FIFA 20 (VJ 28) → AVG(80,74,85,88,46,67) = 73.3 → 73
INSERT INTO VersionJugadorSkill VALUES (28,1,80),(28,2,74),(28,3,85),(28,4,88),(28,5,46),(28,6,67);
UPDATE VersionJugador SET Calificacion = 73 WHERE Id = 28;
-- FIFA 21 (VJ 29) → AVG(83,78,88,91,48,70) = 76.3 → 76
INSERT INTO VersionJugadorSkill VALUES (29,1,83),(29,2,78),(29,3,88),(29,4,91),(29,5,48),(29,6,70);
UPDATE VersionJugador SET Calificacion = 76 WHERE Id = 29;
-- FIFA 22 (VJ 30) → AVG(86,82,91,93,50,72) = 79.0 → 79
INSERT INTO VersionJugadorSkill VALUES (30,1,86),(30,2,82),(30,3,91),(30,4,93),(30,5,50),(30,6,72);
UPDATE VersionJugador SET Calificacion = 79 WHERE Id = 30;
-- FIFA 23 (VJ 31) → AVG(87,84,92,94,52,74) = 80.5 → 81
INSERT INTO VersionJugadorSkill VALUES (31,1,87),(31,2,84),(31,3,92),(31,4,94),(31,5,52),(31,6,74);
UPDATE VersionJugador SET Calificacion = 81 WHERE Id = 31;

-- ============================================================
-- SAM KERR (IdJugador = 6)
-- 4 versiones: FIFA 20 al 23
-- Chelsea toda su carrera en el juego, ST principal
-- ============================================================
INSERT INTO VersionJugador (IdJugador, IdVersion, IdClub, ImagenPath, Calificacion) VALUES
(6, 6, 7, '/img/kerr2020.webp', 0), -- VJ 32: FIFA 20, Chelsea
(6, 7, 7, '/img/kerr2021.webp', 0), -- VJ 33: FIFA 21, Chelsea
(6, 8, 7, '/img/kerr2022.webp', 0), -- VJ 34: FIFA 22, Chelsea
(6, 9, 7, '/img/kerr2023.webp', 0); -- VJ 35: FIFA 23, Chelsea

-- Posiciones Sam Kerr: ST principal + CF alternativa
INSERT INTO VersionJugadorPosicion (IdVersionJugador, IdPosicion, EsPrincipal) VALUES
(32, 13, TRUE),(32, 12, FALSE),
(33, 13, TRUE),(33, 12, FALSE),
(34, 13, TRUE),(34, 12, FALSE),
(35, 13, TRUE),(35, 12, FALSE);

-- Skills Sam Kerr + UPDATE de Calificacion
-- FIFA 20 (VJ 32) → AVG(84,87,65,80,30,74) = 70.0 → 70
INSERT INTO VersionJugadorSkill VALUES (32,1,84),(32,2,87),(32,3,65),(32,4,80),(32,5,30),(32,6,74);
UPDATE VersionJugador SET Calificacion = 70 WHERE Id = 32;
-- FIFA 21 (VJ 33) → AVG(85,89,67,82,31,75) = 71.5 → 72
INSERT INTO VersionJugadorSkill VALUES (33,1,85),(33,2,89),(33,3,67),(33,4,82),(33,5,31),(33,6,75);
UPDATE VersionJugador SET Calificacion = 72 WHERE Id = 33;
-- FIFA 22 (VJ 34) → AVG(86,90,68,84,32,76) = 72.7 → 73
INSERT INTO VersionJugadorSkill VALUES (34,1,86),(34,2,90),(34,3,68),(34,4,84),(34,5,32),(34,6,76);
UPDATE VersionJugador SET Calificacion = 73 WHERE Id = 34;
-- FIFA 23 (VJ 35) → AVG(87,91,69,85,33,77) = 73.7 → 74
INSERT INTO VersionJugadorSkill VALUES (35,1,87),(35,2,91),(35,3,69),(35,4,85),(35,5,33),(35,6,77);
UPDATE VersionJugador SET Calificacion = 74 WHERE Id = 35;