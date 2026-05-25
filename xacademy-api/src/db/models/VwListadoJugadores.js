import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const VwListadoJugadores = sequelize.define('VwListadoJugadores', {
  IdVersionJugador: { type: DataTypes.INTEGER, allowNull: false },
  IdJugador:        { type: DataTypes.INTEGER, allowNull: false },
  Juego:            { type: DataTypes.STRING,  allowNull: false },
  Foto:             { type: DataTypes.STRING,  allowNull: true  },
  Nombre:           { type: DataTypes.STRING,  allowNull: false },
  Apellido:         { type: DataTypes.STRING,  allowNull: false },
  Nacionalidad:     { type: DataTypes.STRING,  allowNull: false },
  Club:             { type: DataTypes.STRING,  allowNull: false },
  PosicionPrincipal:{ type: DataTypes.STRING,  allowNull: true  },
  Calificacion:     { type: DataTypes.INTEGER, allowNull: true, primaryKey: true },
}, {
  tableName:  'vw_ListadoJugadores',
  timestamps: false,
});