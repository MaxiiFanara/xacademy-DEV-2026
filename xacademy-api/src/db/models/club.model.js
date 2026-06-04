// src/models/ClubModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const ClubModel = sequelize.define('Club', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_club_nombre UNIQUE
  },
  IdLiga: {
    type: DataTypes.INTEGER,
    allowNull: true, // Mapea que el campo permite NULL
    references: {
      model: 'Liga', // Vincula con el nombre de la tabla destino
      key: 'Id'
    }
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Club', 
  timestamps: false      
});

export default ClubModel;