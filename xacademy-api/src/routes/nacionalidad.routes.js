import { Router } from 'express';
import nacionalidadController from '../DI/nacionalidad.container.js';

const router = Router();

/**
 * @swagger
 * /api/nacionalidad:
 *   get:
 *     summary: Obtener todas las nacionalidades
 *     tags: [Nacionalidades]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de nacionalidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nacionalidad'
 */
router.get('/', nacionalidadController.getAll);

/**
 * @swagger
 * /api/nacionalidad/{id}:
 *   get:
 *     summary: Obtener una nacionalidad por su ID
 *     tags: [Nacionalidades]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la nacionalidad
 *     responses:
 *       200:
 *         description: Datos de la nacionalidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nacionalidad'
 *       404:
 *         description: Nacionalidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', nacionalidadController.getById);

/**
 * @swagger
 * /api/nacionalidad:
 *   post:
 *     summary: Crear una nueva nacionalidad
 *     tags: [Nacionalidades]
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
 *             properties:
 *               Nombre: { type: string, example: 'Argentina' }
 *     responses:
 *       201:
 *         description: Nacionalidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nacionalidad'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', nacionalidadController.create);

/**
 * @swagger
 * /api/nacionalidad/{id}:
 *   put:
 *     summary: Actualizar una nacionalidad existente
 *     tags: [Nacionalidades]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la nacionalidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre: { type: string }
 *     responses:
 *       200:
 *         description: Nacionalidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nacionalidad'
 *       404:
 *         description: Nacionalidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', nacionalidadController.update);

/**
 * @swagger
 * /api/nacionalidad/{id}:
 *   delete:
 *     summary: Eliminar una nacionalidad
 *     tags: [Nacionalidades]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la nacionalidad
 *     responses:
 *       200:
 *         description: Nacionalidad eliminada exitosamente
 *       404:
 *         description: Nacionalidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', nacionalidadController.delete);

export default router;
