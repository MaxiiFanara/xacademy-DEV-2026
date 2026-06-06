import { Router } from 'express';
import versionController from '../DI/version.container.js';

const router = Router();

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Obtener todas las versiones de juego
 *     tags: [Versiones]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de versiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Version'
 */
router.get('/', versionController.getAll);

/**
 * @swagger
 * /api/version/{id}:
 *   get:
 *     summary: Obtener una versión por su ID
 *     tags: [Versiones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la versión
 *     responses:
 *       200:
 *         description: Datos de la versión
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Version'
 *       404:
 *         description: Versión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', versionController.getById);

/**
 * @swagger
 * /api/version:
 *   post:
 *     summary: Crear una nueva versión de juego
 *     tags: [Versiones]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - AnioJuego
 *             properties:
 *               Nombre:    { type: string, example: 'FIFA 23' }
 *               AnioJuego: { type: integer, example: 2023 }
 *     responses:
 *       201:
 *         description: Versión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Version'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', versionController.create);

/**
 * @swagger
 * /api/version/{id}:
 *   put:
 *     summary: Actualizar una versión existente
 *     tags: [Versiones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la versión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:    { type: string }
 *               AnioJuego: { type: integer }
 *     responses:
 *       200:
 *         description: Versión actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Version'
 *       404:
 *         description: Versión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', versionController.update);

/**
 * @swagger
 * /api/version/{id}:
 *   delete:
 *     summary: Eliminar una versión
 *     tags: [Versiones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la versión
 *     responses:
 *       200:
 *         description: Versión eliminada exitosamente
 *       404:
 *         description: Versión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', versionController.delete);

export default router;
