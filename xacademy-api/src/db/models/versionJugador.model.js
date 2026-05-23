// src/models/VersionJugadorModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const VersionJugadorModel = sequelize.define('VersionJugador', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  IdJugador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'uq_versionjugador_jugador_version', // Define la clave única compuesta junto con IdVersion
    references: {
      model: 'Jugador',
      key: 'Id'
    }
  },
  IdVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'uq_versionjugador_jugador_version', // Define la clave única compuesta junto con IdJugador
    references: {
      model: 'Version',
      key: 'Id'
    }
  },
  IdClub: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Club',
      key: 'Id'
    }
  },
  ImagenUrl: {
    type: DataTypes.STRING(500),
    allowNull: true // Mapea VARCHAR(500) NULL para las fotos cambiantes por edición
  },
  Calificacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 99 // Mapea el CONSTRAINT chk_versionjugador_calificacion CHECK (BETWEEN 0 AND 99)
    }
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'VersionJugador', 
  timestamps: false      
});

export default VersionJugadorModel;