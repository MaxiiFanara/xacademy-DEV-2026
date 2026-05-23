import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import ligaController from '../DI/liga.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', ligaController.getAll);
router.get('/:id', ligaController.getById);
router.post('/', ligaController.create);
router.put('/:id', ligaController.update);
router.delete('/:id', ligaController.delete);

export default router;