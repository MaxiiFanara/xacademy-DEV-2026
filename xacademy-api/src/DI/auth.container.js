import AuthRepository from '../repositories/auth.repository.js';
import AuthService from '../services/auth.service.js';
import AuthController from '../controllers/auth.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const authRepository = new AuthRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const authService = new AuthService(authRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const authController = new AuthController(authService);

// 4. Exportamos el controlador listo para conectarse a Express
export default authController;