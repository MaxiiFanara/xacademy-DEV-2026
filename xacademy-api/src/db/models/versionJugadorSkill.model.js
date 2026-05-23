// src/models/VersionJugadorSkillModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const VersionJugadorSkillModel = sequelize.define('VersionJugadorSkill', {
  IdVersionJugador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'VersionJugador',
      key: 'Id'
    }
  },
  IdSkill: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'Skill',
      key: 'Id'
    }
  },
  Valor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 99 // Mapea el CONSTRAINT chk_versionjugadorskill_valor CHECK (BETWEEN 0 AND 99)
    }
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'VersionJugadorSkill', 
  timestamps: false      
});

export default VersionJugadorSkillModel;