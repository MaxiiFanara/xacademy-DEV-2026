// src/models/PosicionModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const PosicionModel = sequelize.define('Posicion', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Posicion', 
  timestamps: false      
});

export default PosicionModel;