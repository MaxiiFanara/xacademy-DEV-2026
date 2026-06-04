import { Router } from 'express';
import jugadorController from '../DI/jugador.container.js';
import { requireAuth } from '../middleware/auth.js';
import { validateCreateJugador, validateUpdateJugador } from '../middleware/jugador.validator.js';

import { uploadImage, uploadCsv, parseMultipartBody } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/jugador:
 *   get:
 *     summary: Obtener listado paginado de jugadores
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: versionId
 *         schema:
 *           type: integer
 *         description: Filtrar por versión de juego (ID)
 *       - in: query
 *         name: esHombre
 *         schema:
 *           type: boolean
 *         description: Filtrar por género (true = hombre, false = mujer)
 *       - in: query
 *         name: creadoPorMi
 *         schema:
 *           type: boolean
 *         description: Mostrar solo jugadores creados por el usuario autenticado
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre o apellido
 *       - in: query
 *         name: clubId
 *         schema:
 *           type: integer
 *         description: Filtrar por club
 *       - in: query
 *         name: nacionalidadId
 *         schema:
 *           type: integer
 *         description: Filtrar por nacionalidad
 *       - in: query
 *         name: posicionId
 *         schema:
 *           type: integer
 *         description: Filtrar por posición
 *     responses:
 *       200:
 *         description: Lista paginada de jugadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedJugadores'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/',               jugadorController.getAll);

/**
 * @swagger
 * /api/jugador/export:
 *   get:
 *     summary: Exportar todos los jugadores en formato CSV
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV con todos los jugadores
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/export',         jugadorController.exportAll);

/**
 * @swagger
 * /api/jugador/import:
 *   post:
 *     summary: Importar jugadores desde un archivo CSV
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - csv
 *             properties:
 *               csv:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV con los jugadores a importar
 *     responses:
 *       200:
 *         description: Jugadores importados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imported: { type: 'integer' }
 *                 errors:   { type: 'array', items: { type: 'string' } }
 *       400:
 *         description: Archivo inválido o datos incorrectos
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
 */
router.post('/import',        uploadCsv.single('csv'), jugadorController.importCsv);

/**
 * @swagger
 * /api/jugador/{id}/jugador-id:
 *   get:
 *     summary: Obtener el IdJugador base a partir de un IdVersionJugador
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: IdVersionJugador
 *     responses:
 *       200:
 *         description: IdJugador correspondiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 IdJugador: { type: integer }
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
 */
router.get('/:id/jugador-id', jugadorController.getIdJugador);

/**
 * @swagger
 * /api/jugador/{id}/evolucion:
 *   get:
 *     summary: Obtener la evolución de skills de un jugador a través de las versiones
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: IdVersionJugador
 *       - in: query
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill a consultar (ver GET /api/skill)
 *     responses:
 *       200:
 *         description: Evolución de skills del jugador
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   version:  { type: string }
 *                   skill:    { type: string }
 *                   valor:    { type: integer }
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
 */
router.get('/:id/evolucion',  jugadorController.getEvolucionSkill);

/**
 * @swagger
 * /api/jugador/{id}:
 *   get:
 *     summary: Obtener un jugador por su ID
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: IdVersionJugador
 *     responses:
 *       200:
 *         description: Datos del jugador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jugador'
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
 */
router.get('/:id',            jugadorController.getById);

/**
 * @swagger
 * /api/jugador:
 *   post:
 *     summary: Crear un nuevo jugador
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - Apellido
 *               - IdVersionJuego
 *               - IdClub
 *               - IdNacionalidad
 *               - IdPosicionPrincipal
 *               - Calificacion
 *               - EsHombre
 *             properties:
 *               Nombre:             { type: string }
 *               Apellido:           { type: string }
 *               IdVersionJuego:     { type: integer }
 *               IdClub:             { type: integer }
 *               IdNacionalidad:     { type: integer }
 *               IdPosicionPrincipal:{ type: integer }
 *               Calificacion:       { type: integer, minimum: 1, maximum: 99 }
 *               EsHombre:           { type: boolean }
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Foto del jugador (opcional)
 *     responses:
 *       201:
 *         description: Jugador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jugador'
 *       400:
 *         description: Datos inválidos
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
 */
router.post('/',              uploadImage.single('imagen'), parseMultipartBody, ...validateCreateJugador, jugadorController.create);

/**
 * @swagger
 * /api/jugador/{id}:
 *   put:
 *     summary: Actualizar un jugador existente
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: IdVersionJugador
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:             { type: string }
 *               Apellido:           { type: string }
 *               IdVersionJuego:     { type: integer }
 *               IdClub:             { type: integer }
 *               IdNacionalidad:     { type: integer }
 *               IdPosicionPrincipal:{ type: integer }
 *               Calificacion:       { type: integer, minimum: 1, maximum: 99 }
 *               EsHombre:           { type: boolean }
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Nueva foto del jugador (opcional)
 *     responses:
 *       200:
 *         description: Jugador actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jugador'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
router.put('/:id',            uploadImage.single('imagen'), parseMultipartBody, ...validateUpdateJugador, jugadorController.update);

/**
 * @swagger
 * /api/jugador/{id}:
 *   delete:
 *     summary: Eliminar un jugador
 *     tags: [Jugadores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: IdVersionJugador
 *     responses:
 *       200:
 *         description: Jugador eliminado exitosamente
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
 */
router.delete('/:id',         jugadorController.delete);

export default router;
