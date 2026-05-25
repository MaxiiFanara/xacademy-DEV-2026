import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import jugadorController from '../DI/jugador.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', jugadorController.getAll);
router.get('/:id/evolucion', jugadorController.getEvolucionSkill); // ← antes de /:id
router.get('/:id', jugadorController.getById);
router.post('/', jugadorController.create);
router.put('/:id', jugadorController.update);
router.delete('/:id', jugadorController.delete);

export default router;

