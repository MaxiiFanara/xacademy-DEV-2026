import { sequelize } from '../connection.js';
import { DataTypes } from 'sequelize';

export const VwDetalleJugador = sequelize.define('VwDetalleJugador', {
  IdVersionJugador: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  Juego:            { type: DataTypes.STRING,  allowNull: false },
  Nombre:           { type: DataTypes.STRING,  allowNull: false },
  Apellido:         { type: DataTypes.STRING,  allowNull: false },
  Nacionalidad:     { type: DataTypes.STRING,  allowNull: false },
  Club:             { type: DataTypes.STRING,  allowNull: false },
  Calificacion:     { type: DataTypes.INTEGER, allowNull: true  },
  Skill:            { type: DataTypes.STRING,  allowNull: false },
  ValorSkill:       { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName:  'vw_DetalleJugador',
  timestamps: false,
});