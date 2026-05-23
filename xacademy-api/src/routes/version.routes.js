import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import versionController from '../DI/version.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', versionController.getAll);
router.get('/:id', versionController.getById);
router.post('/', versionController.create);
router.put('/:id', versionController.update);
router.delete('/:id', versionController.delete);

export default router;


