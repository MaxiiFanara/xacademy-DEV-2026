// xacademy-api/src/db/connection.js
'use strict'

import Sequelize from 'sequelize'
import  {sequelizeConfig} from '../config/database.js'

export const sequelize = new Sequelize(
    sequelizeConfig.database,
    sequelizeConfig.username,
    sequelizeConfig.password,
    sequelizeConfig
)

export const connectDB = async () => {
    await sequelize.authenticate()
}





