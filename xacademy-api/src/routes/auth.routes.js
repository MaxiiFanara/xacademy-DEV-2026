import { Router } from 'express';
import authController from '../DI/auth.container.js';
import { requireAuth, alreadyAuth } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/auth.validator.js';

console.log('requireAuth:', typeof requireAuth);
console.log('alreadyAuth:', typeof alreadyAuth);
console.log('authController:', typeof authController);
console.log('authController.register:', typeof authController?.register);

const router = Router();

router.post('/register', alreadyAuth, ...validateRegister, authController.register);
router.post('/login',    alreadyAuth, ...validateLogin,    authController.login);
router.post('/logout',   requireAuth,                   authController.logout);
router.get('/me',        requireAuth,                   authController.me);

export default router;