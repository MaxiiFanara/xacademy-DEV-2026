// src/models/SkillModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const SkillModel = sequelize.define('Skill', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_skill_nombre UNIQUE
  },
  EsArquero: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Mapea el DEFAULT FALSE del script
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Skill', 
  timestamps: false      
});

export default SkillModel;