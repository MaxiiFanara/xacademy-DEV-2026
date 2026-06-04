import { sequelize } from '../connection.js';
import { DataTypes } from 'sequelize';

export const VwDetalleJugador = sequelize.define('VwDetalleJugador', {
  IdVersionJugador: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  IdJugador:        { type: DataTypes.INTEGER, allowNull: false },
  Juego:            { type: DataTypes.STRING,  allowNull: false },
  Nombre:           { type: DataTypes.STRING,  allowNull: false },
  Apellido:         { type: DataTypes.STRING,  allowNull: false },
  IdNacionalidad:   { type: DataTypes.INTEGER, allowNull: false },
  Nacionalidad:     { type: DataTypes.STRING,  allowNull: false },
  IdClub:           { type: DataTypes.INTEGER, allowNull: false },
  Club:             { type: DataTypes.STRING,  allowNull: false },
  IdLiga:           { type: DataTypes.INTEGER, allowNull: false },
  ImagenUrl:        { type: DataTypes.STRING,  allowNull: true  },
  IdSkill:          { type: DataTypes.INTEGER, allowNull: false },
  Skill:            { type: DataTypes.STRING,  allowNull: false },
  ValorSkill:       { type: DataTypes.INTEGER, allowNull: false },
  Calificacion:     { type: DataTypes.INTEGER, allowNull: true  },
}, {
  tableName:  'vw_DetalleJugador',
  timestamps: false,
});