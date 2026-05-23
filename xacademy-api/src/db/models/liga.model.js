// src/models/LigaModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const LigaModel = sequelize.define('Liga', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_liga_nombre UNIQUE
  },
  IdNacionalidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Nacionalidad', // Vincula con el nombre de la tabla destino
      key: 'Id'
    }
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Liga', 
  timestamps: false      
});

export default LigaModel;