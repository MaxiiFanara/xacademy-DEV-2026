import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import posicionController from '../DI/posicion.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', posicionController.getAll);
router.get('/:id', posicionController.getById);
router.post('/', posicionController.create);
router.put('/:id', posicionController.update);
router.delete('/:id', posicionController.delete);

export default router;