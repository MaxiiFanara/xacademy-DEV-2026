// src/models/UsuarioModel.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';

const UsuarioModel = sequelize.define('Usuario', {
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
  NombreUsuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_usuario_nombreusuario UNIQUE
  },
  Email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true // Mapea el CONSTRAINT uq_usuario_email UNIQUE
  },
  Pwd: {
    type: DataTypes.STRING(255),
    allowNull: true // Permite NULL para los usuarios que entren con Google/GitHub
  },
  AuthProvider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'local' // Mapea el DEFAULT 'local'
  },
  ProviderId: {
    type: DataTypes.STRING(255),
    allowNull: true // Permite NULL para los usuarios locales
  }
}, {
  // Configuración para que coincida exactamente con la base de datos
  tableName: 'Usuario', 
  timestamps: false,
  
  // Sequelize permite emular el CONSTRAINT chk_auth a nivel de código de esta forma:
  validate: {
    checkAuthConsistency() {
      if (this.AuthProvider === 'local') {
        if (!this.Pwd || this.ProviderId) {
          throw new Error("Un usuario local debe tener contraseña (Pwd) y no tener ProviderId.");
        }
      } else {
        if (!this.ProviderId || this.Pwd) {
          throw new Error("Un usuario OAuth debe tener ProviderId y no tener contraseña (Pwd).");
        }
      }
    }
  }
});

export default UsuarioModel;