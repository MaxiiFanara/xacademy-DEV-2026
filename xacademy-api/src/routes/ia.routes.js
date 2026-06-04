import { Router } from 'express';
import iaController from '../DI/ia.container.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/ia/jugador/{id}/analisis:
 *   get:
 *     summary: Obtener análisis de IA para un jugador
 *     tags: [IA]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: IdVersionJugador (se resuelve internamente a IdJugador)
 *     responses:
 *       200:
 *         description: Análisis generado por IA sobre la evolución del jugador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalisisIA'
 *       404:
 *         description: Jugador no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: Servicio de IA no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/jugador/:id/analisis', iaController.analyzePlayer);

export default router;
