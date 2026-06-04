// xacademy-api/src/config/database.js
'use strict'
import {env} from './env.js' 

export const sequelizeConfig = {
    dialect: env.DB.DIALECT,
    host:     env.DB.HOST     || 'localhost',
    port:     parseInt(env.DB.PORT || '3306', 10),
    username: env.DB.USER     || 'root',
    password: env.DB.PASSWORD || '',
    database: env.DB.NAME     || 'fifa_db',

    // ── Pool de conexiones ───────────────────────────────────
    // Evita abrir una conexión nueva por cada query
    // max: máximo de conexiones simultáneas
    // min: conexiones mínimas siempre abiertas
    // acquire: tiempo máximo (ms) para obtener una conexión antes de lanzar error
    // idle: tiempo (ms) que una conexión puede estar inactiva antes de liberarse
    pool: {
        max:     10,
        min:     2,
        acquire: 30000,
        idle:    10000
    },

    // ── Opciones globales de modelos ─────────────────────────
    define: {
        // Evita que Sequelize agregue createdAt y updatedAt
        // automáticamente. Nuestras tablas no tienen esas columnas.
        timestamps: false,

        // Evita que Sequelize pluralice los nombres de las tablas.
        // Si el modelo se llama Jugador, la tabla se llama Jugador (no Jugadors).
        freezeTableName: true,

        // Snake case en los nombres de columnas generados automáticamente
        underscored: false
    },

    // ── Encoding ─────────────────────────────────────────────
    charset: 'utf8mb4',
    dialectOptions: {
        charset: 'utf8mb4',
    },

    // ── Sincronización ───────────────────────────────────────
    // false: Sequelize NO altera ni crea tablas automáticamente.
    // Nuestro schema ya está definido en fifa_database.sql.
    // Cambiarlo a true puede pisar datos o alterar la estructura.
    sync: { force: false },

    // ── Logging ──────────────────────────────────────────────
    // En desarrollo muestra las queries SQL en consola.
    // En producción se apaga para no llenar los logs.
    
}

