import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import nacionalidadController from '../DI/nacionalidad.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', nacionalidadController.getAll);
router.get('/:id', nacionalidadController.getById);
router.post('/', nacionalidadController.create);
router.put('/:id', nacionalidadController.update);
router.delete('/:id', nacionalidadController.delete);

export default router;