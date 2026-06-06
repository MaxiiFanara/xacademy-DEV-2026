import { Router } from 'express';
import skillController from '../DI/skill.container.js';

const router = Router();

/**
 * @swagger
 * /api/skill:
 *   get:
 *     summary: Obtener todas las skills
 *     tags: [Skills]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 */
router.get('/', skillController.getAll);

/**
 * @swagger
 * /api/skill/{id}:
 *   get:
 *     summary: Obtener una skill por su ID
 *     tags: [Skills]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill
 *     responses:
 *       200:
 *         description: Datos de la skill
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', skillController.getById);

/**
 * @swagger
 * /api/skill:
 *   post:
 *     summary: Crear una nueva skill
 *     tags: [Skills]
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
 *               - EsArquero
 *             properties:
 *               Nombre:    { type: string, example: 'Velocidad' }
 *               EsArquero: { type: boolean }
 *     responses:
 *       201:
 *         description: Skill creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', skillController.create);

/**
 * @swagger
 * /api/skill/{id}:
 *   put:
 *     summary: Actualizar una skill existente
 *     tags: [Skills]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:    { type: string }
 *               EsArquero: { type: boolean }
 *     responses:
 *       200:
 *         description: Skill actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', skillController.update);

/**
 * @swagger
 * /api/skill/{id}:
 *   delete:
 *     summary: Eliminar una skill
 *     tags: [Skills]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill
 *     responses:
 *       200:
 *         description: Skill eliminada exitosamente
 *       404:
 *         description: Skill no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', skillController.delete);

export default router;
