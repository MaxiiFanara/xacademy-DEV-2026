import { Router } from 'express';
import iaController from '../DI/ia.container.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/jugador/:id/analisis', iaController.analyzePlayer);

export default router;