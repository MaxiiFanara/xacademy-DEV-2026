'use strict'
import {env} from './env.js'

export const sequelizeConfig = {
    dialect: env.DB.DIALECT,
    host:     env.DB.HOST     || 'localhost',
    port:     parseInt(env.DB.PORT || '3306', 10),
    username: env.DB.USER     || 'root',
    password: env.DB.PASSWORD || '',
    database: env.DB.NAME     || 'fifa_db',

    pool: {
        max:     10,
        min:     2,
        acquire: 30000,
        idle:    10000
    },

    define: {
        timestamps: false,
        freezeTableName: true,
        underscored: false
    },

    charset: 'utf8mb4',
    dialectOptions: {
        charset: 'utf8mb4',
    },

    sync: { force: false },
}
