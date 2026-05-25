import { sequelize } from '../connection.js';
import { DataTypes } from 'sequelize';

export const VwEvolucionSkillJugador = sequelize.define('VwEvolucionSkillJugador', {
  IdJugador:  { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  Nombre:     { type: DataTypes.STRING,  allowNull: false },
  Apellido:   { type: DataTypes.STRING,  allowNull: false },
  IdSkill:    { type: DataTypes.INTEGER, allowNull: false },
  Skill:      { type: DataTypes.STRING,  allowNull: false },
  AnioJuego:  { type: DataTypes.INTEGER, allowNull: false },
  Juego:      { type: DataTypes.STRING,  allowNull: false },
  ValorSkill: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName:  'vw_EvolucionSkillJugador',
  timestamps: false,
});