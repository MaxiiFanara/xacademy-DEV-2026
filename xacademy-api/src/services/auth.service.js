import authRepository from '../repositories/auth.repository.js';
import { hashPassword, comparePassword }  from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }
  async register({ Nombre, Apellido, NombreUsuario, Email, Pwd }) {
    const existing = await this.authRepository.findByEmail(Email);
    if (existing) throw new Error('El email ya está registrado');

    const user = await this.authRepository.create({
      Nombre,
      Apellido,
      NombreUsuario,
      Email,
      Pwd:          hashPassword(Pwd),
      AuthProvider: 'local',
    });

    return this._buildTokens(user);
  }

  async login(Email, Pwd) {
    const user = await this.authRepository.findByEmail(Email);
    if (!user) throw new Error('Credenciales inválidas');

    if (!comparePassword(Pwd, user.Pwd)) throw new Error('Credenciales inválidas');

    return this._buildTokens(user);
  }

  async refreshFromToken(refreshToken) {
    const payload = verifyToken(refreshToken);
    if (!payload) throw new Error('Refresh token inválido o expirado');

    const user = await this.authRepository.findByEmail(payload.email);
    if (!user)   throw new Error('Usuario no encontrado');

    return this._buildTokens(user);
  }

  _buildTokens(user) {
    return {
      accessToken:  generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
      user: {
        nombre:        user.Nombre,
        apellido:      user.Apellido,
        nombreUsuario: user.NombreUsuario,
        email:         user.Email,
        // ← id nunca se expone
      },
    };
  }
}

export default AuthService;