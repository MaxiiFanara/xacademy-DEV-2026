import { Router }   from 'express';
import authController from '../DI/auth.container.js';
import { requireAuth, alreadyAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', alreadyAuth, authController.register);
router.post('/login',    alreadyAuth, authController.login);
router.post('/logout',   requireAuth, authController.logout);
router.get('/me',        requireAuth, authController.me);

export default router;