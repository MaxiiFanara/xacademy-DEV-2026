import AuthRepository from '../repositories/auth.repository.js';
import AuthService from '../services/auth.service.js';
import AuthController from '../controllers/auth.controller.js';

export const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export default authController;