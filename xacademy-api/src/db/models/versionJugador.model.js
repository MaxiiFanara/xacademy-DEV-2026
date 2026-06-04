import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

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
    unique: 'uq_versionjugador_jugador_version',
    references: {
      model: 'Jugador',
      key: 'Id'
    }
  },
  IdVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'uq_versionjugador_jugador_version',
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
  ImagenPath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  Calificacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 99
    }
  }
}, {
  tableName: 'VersionJugador',
  timestamps: false
});

export default VersionJugadorModel;