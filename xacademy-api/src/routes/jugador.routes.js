import { Router } from 'express';
import jugadorController from '../DI/jugador.container.js';
import { requireAuth } from '../middleware/auth.js';
import { validateCreateJugador, validateUpdateJugador } from '../middleware/jugador.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/',              jugadorController.getAll);
router.get('/export', requireAuth, jugadorController.exportAll);
router.get('/:id/jugador-id', jugadorController.getIdJugador);
router.get('/:id/evolucion', jugadorController.getEvolucionSkill);
router.get('/:id',           jugadorController.getById);
router.post('/',             ...validateCreateJugador, jugadorController.create);
router.put('/:id',           ...validateUpdateJugador, jugadorController.update);
router.delete('/:id',        jugadorController.delete);

export default router;