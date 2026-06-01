import { Router } from 'express';
import jugadorController from '../DI/jugador.container.js';
import { requireAuth } from '../middleware/auth.js';
import { validateCreateJugador, validateUpdateJugador } from '../middleware/jugador.validator.js';

import { uploadImage, uploadCsv } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

router.get('/',               jugadorController.getAll);
router.get('/export',         jugadorController.exportAll);
router.post('/import',        uploadCsv.single('csv'), jugadorController.importCsv);  // ← antes de POST /
router.get('/:id/jugador-id', jugadorController.getIdJugador);
router.get('/:id/evolucion',  jugadorController.getEvolucionSkill);
router.get('/:id',            jugadorController.getById);
router.post('/',              uploadImage.single('imagen'), ...validateCreateJugador, jugadorController.create);
router.put('/:id',            uploadImage.single('imagen'), ...validateUpdateJugador, jugadorController.update);
router.delete('/:id',         jugadorController.delete);

export default router;