// src/models/VersionModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const VersionModel = sequelize.define('Version', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_version_anio UNIQUE
  },
  Nombre: {
    type: DataTypes.STRING(50), // Mapea el VARCHAR(50)
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_version_nombre UNIQUE
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Version', 
  timestamps: false      
});

export default VersionModel;