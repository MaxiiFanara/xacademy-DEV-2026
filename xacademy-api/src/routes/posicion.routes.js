import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import posicionController from '../DI/posicion.container.js';

const router = Router();

/**
 * @swagger
 * /api/posicion:
 *   get:
 *     summary: Obtener todas las posiciones
 *     tags: [Posiciones]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de posiciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Posicion'
 */
router.get('/', posicionController.getAll);

/**
 * @swagger
 * /api/posicion/{id}:
 *   get:
 *     summary: Obtener una posición por su ID
 *     tags: [Posiciones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la posición
 *     responses:
 *       200:
 *         description: Datos de la posición
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Posicion'
 *       404:
 *         description: Posición no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', posicionController.getById);

/**
 * @swagger
 * /api/posicion:
 *   post:
 *     summary: Crear una nueva posición
 *     tags: [Posiciones]
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
 *               Nombre: { type: string, example: 'ST' }
 *     responses:
 *       201:
 *         description: Posición creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Posicion'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', posicionController.create);

/**
 * @swagger
 * /api/posicion/{id}:
 *   put:
 *     summary: Actualizar una posición existente
 *     tags: [Posiciones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la posición
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
 *         description: Posición actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Posicion'
 *       404:
 *         description: Posición no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', posicionController.update);

/**
 * @swagger
 * /api/posicion/{id}:
 *   delete:
 *     summary: Eliminar una posición
 *     tags: [Posiciones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la posición
 *     responses:
 *       200:
 *         description: Posición eliminada exitosamente
 *       404:
 *         description: Posición no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', posicionController.delete);

export default router;
