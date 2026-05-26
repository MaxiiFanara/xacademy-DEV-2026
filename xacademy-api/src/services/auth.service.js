import { hashPassword, comparePassword }    from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { RegisterDto, LoginDto, UsuarioResponseDto } from '../dtos/auth.dto.js';

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async register(body) {
    const dto = new RegisterDto(body);  // ← sanitiza la entrada

    const existing = await this.authRepository.findByEmail(dto.Email);
    if (existing) throw new Error('El email ya está registrado');

    const user = await this.authRepository.create({
      Nombre:        dto.Nombre,
      Apellido:      dto.Apellido,
      NombreUsuario: dto.NombreUsuario,
      Email:         dto.Email,
      Pwd:           hashPassword(dto.Pwd),
      AuthProvider:  'local',
    });

    return this._buildTokens(user);
  }

  async login(body) {
    const dto = new LoginDto(body);  // ← sanitiza la entrada

    const user = await this.authRepository.findByEmail(dto.Email);
    if (!user) throw new Error('Credenciales inválidas');

    if (!comparePassword(dto.Pwd, user.Pwd)) throw new Error('Credenciales inválidas');

    return this._buildTokens(user);
  }

  async refreshFromToken(refreshToken) {
    const payload = verifyToken(refreshToken);
    if (!payload) throw new Error('Refresh token inválido o expirado');

    const user = await this.authRepository.findByEmail(payload.email);
    if (!user) throw new Error('Usuario no encontrado');

    return this._buildTokens(user);
  }

  _buildTokens(user) {
    return {
      accessToken:  generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
      user:         new UsuarioResponseDto(user),  // ← DTO de salida
    };
  }
}

export default AuthService;