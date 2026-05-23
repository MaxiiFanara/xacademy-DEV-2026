import { sequelize } from '../connection.js';
import { DataTypes } from 'sequelize';

export const VwListadoJugadores = sequelize.define('VwListadoJugadores', {
  Juego:             { type: DataTypes.STRING,  allowNull: false },
  Foto:              { type: DataTypes.STRING,  allowNull: true  },
  Nombre:            { type: DataTypes.STRING,  allowNull: false },
  Apellido:          { type: DataTypes.STRING,  allowNull: false },
  Nacionalidad:      { type: DataTypes.STRING,  allowNull: false },
  Club:              { type: DataTypes.STRING,  allowNull: false },
  PosicionPrincipal: { type: DataTypes.STRING,  allowNull: true  },
  Calificacion:      { type: DataTypes.INTEGER, allowNull: true,  primaryKey: true }, // ← truco para vistas
}, {
  tableName:  'vw_ListadoJugadores',
  timestamps: false,
});