// src/models/JugadorModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

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
    type: DataTypes.DATEONLY, // DATEONLY mapea exactamente el tipo DATE de SQL sin la hora
    allowNull: true
  },
  EsHombre: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  EsRetirado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Mapea el DEFAULT FALSE
  },
  AnioRetiro: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  EsDelJuegoBase: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Mapea el DEFAULT FALSE
  },
  EsActivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true // Mapea el DEFAULT TRUE
  },
  IdNacionalidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Nacionalidad', // Vincula con la tabla destino
      key: 'Id'
    }
  },
  IdUsuarioCreador: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permite NULL para jugadores del sistema (CSV)
    references: {
      model: 'Usuario', // Vincula con la tabla destino
      key: 'Id'
    }
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Jugador', 
  timestamps: false,

  // Validaciones a nivel de modelo para asegurar la consistencia antes de impactar la DB
  validate: {
    checkRetiroConsistency() {
      if (this.EsRetirado && this.AnioRetiro === null) {
        throw new Error("Consistencia de retiro: Si EsRetirado es TRUE, AnioRetiro no puede ser nulo.");
      }
      if (!this.EsRetirado && this.AnioRetiro !== null) {
        throw new Error("Consistencia de retiro: Si EsRetirado es FALSE, AnioRetiro debe ser nulo.");
      }
    },
    checkEstadoConsistency() {
      if (this.EsDelJuegoBase && !this.EsActivo) {
        throw new Error("Consistencia de estado: Un jugador del juego base no puede pasar a estar inactivo.");
      }
    }
  }
});

export default JugadorModel;