// src/models/NacionalidadModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';
const NacionalidadModel = sequelize.define('Nacionalidad', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Nombre: {
    type: DataTypes.STRING(100), // Mapea el VARCHAR(100)
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_nacionalidad_nombre UNIQUE
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Nacionalidad', 
  timestamps: false      
});

export default NacionalidadModel;