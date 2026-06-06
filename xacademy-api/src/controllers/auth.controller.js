import {setTokenCookies} from '../utils/cookies.js';
import logger from '../config/winston.js';

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res) => {
  try {
    const { user } = await this.authService.register(req.body);
    res.status(201).json({ user });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ error: error.message });
  }
};

  login = async (req, res) => {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(req.body);
      setTokenCookies(res, accessToken, refreshToken);
      res.status(200).json({ user });
    } catch (error) {
      logger.error(error);
      res.status(401).json({ error: error.message });
    }
  };

  logout = async (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  };

  me = async (req, res) => {
    const { Nombre, Apellido, NombreUsuario, Email } = req.user;
    res.status(200).json({ nombre: Nombre, apellido: Apellido, nombreUsuario: NombreUsuario, email: Email });
  };
}

export default AuthController;
