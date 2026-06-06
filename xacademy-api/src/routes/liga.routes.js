import { Router } from 'express';
import ligaController from '../DI/liga.container.js';

const router = Router();

/**
 * @swagger
 * /api/liga:
 *   get:
 *     summary: Obtener todas las ligas
 *     tags: [Ligas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de ligas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Liga'
 */
router.get('/', ligaController.getAll);

/**
 * @swagger
 * /api/liga/{id}:
 *   get:
 *     summary: Obtener una liga por su ID
 *     tags: [Ligas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la liga
 *     responses:
 *       200:
 *         description: Datos de la liga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Liga'
 *       404:
 *         description: Liga no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', ligaController.getById);

/**
 * @swagger
 * /api/liga:
 *   post:
 *     summary: Crear una nueva liga
 *     tags: [Ligas]
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
 *               - IdNacionalidad
 *             properties:
 *               Nombre:         { type: string, example: 'La Liga' }
 *               IdNacionalidad: { type: integer }
 *     responses:
 *       201:
 *         description: Liga creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Liga'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', ligaController.create);

/**
 * @swagger
 * /api/liga/{id}:
 *   put:
 *     summary: Actualizar una liga existente
 *     tags: [Ligas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la liga
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:         { type: string }
 *               IdNacionalidad: { type: integer }
 *     responses:
 *       200:
 *         description: Liga actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Liga'
 *       404:
 *         description: Liga no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', ligaController.update);

/**
 * @swagger
 * /api/liga/{id}:
 *   delete:
 *     summary: Eliminar una liga
 *     tags: [Ligas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la liga
 *     responses:
 *       200:
 *         description: Liga eliminada exitosamente
 *       404:
 *         description: Liga no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', ligaController.delete);

export default router;
