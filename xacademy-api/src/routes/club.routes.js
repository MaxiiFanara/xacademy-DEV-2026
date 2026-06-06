import { Router } from 'express';
import clubController from '../DI/club.container.js';

const router = Router();

/**
 * @swagger
 * /api/club:
 *   get:
 *     summary: Obtener todos los clubes
 *     tags: [Clubes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de clubes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Club'
 */
router.get('/', clubController.getAll);

/**
 * @swagger
 * /api/club/{id}:
 *   get:
 *     summary: Obtener un club por su ID
 *     tags: [Clubes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del club
 *     responses:
 *       200:
 *         description: Datos del club
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       404:
 *         description: Club no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', clubController.getById);

/**
 * @swagger
 * /api/club/liga/{ligaId}:
 *   get:
 *     summary: Obtener todos los clubes de una liga
 *     tags: [Clubes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ligaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la liga
 *     responses:
 *       200:
 *         description: Lista de clubes de la liga
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Club'
 *       404:
 *         description: Liga no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/liga/:ligaId', clubController.getByLiga);

/**
 * @swagger
 * /api/club:
 *   post:
 *     summary: Crear un nuevo club
 *     tags: [Clubes]
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
 *               - IdLiga
 *             properties:
 *               Nombre: { type: string, example: 'FC Barcelona' }
 *               IdLiga: { type: integer }
 *     responses:
 *       201:
 *         description: Club creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', clubController.create);

/**
 * @swagger
 * /api/club/{id}:
 *   put:
 *     summary: Actualizar un club existente
 *     tags: [Clubes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del club
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre: { type: string }
 *               IdLiga: { type: integer }
 *     responses:
 *       200:
 *         description: Club actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       404:
 *         description: Club no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', clubController.update);

/**
 * @swagger
 * /api/club/{id}:
 *   delete:
 *     summary: Eliminar un club
 *     tags: [Clubes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del club
 *     responses:
 *       200:
 *         description: Club eliminado exitosamente
 *       404:
 *         description: Club no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', clubController.delete);

export default router;
