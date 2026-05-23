// src/models/VersionJugadorPosicionModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const VersionJugadorPosicionModel = sequelize.define('VersionJugadorPosicion', {
  IdVersionJugador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'VersionJugador',
      key: 'Id'
    }
  },
  IdPosicion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'Posicion',
      key: 'Id'
    }
  },
  EsPrincipal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'VersionJugadorPosicion', 
  timestamps: false      
});

export default VersionJugadorPosicionModel;