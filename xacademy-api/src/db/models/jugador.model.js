// src/db/models/Jugador.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

const JugadorModel = sequelize.define('Jugador', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  FechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  EsHombre: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  EsRetirado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  AnioRetiro: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  EsDelJuegoBase: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  EsActivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  IdNacionalidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Nacionalidad', key: 'Id' }
  },
  IdUsuarioCreador: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Usuario', key: 'Id' }
  }
}, {
  tableName:  'Jugador',
  timestamps: false,
  // validate eliminado — la DB maneja los constraints
});

export default JugadorModel;