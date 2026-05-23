import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import skillController from '../DI/skill.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', skillController.getAll);
router.get('/:id', skillController.getById);
router.post('/', skillController.create);
router.put('/:id', skillController.update);
router.delete('/:id', skillController.delete);

export default router;