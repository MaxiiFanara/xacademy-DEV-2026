import { Router } from 'express';
// Importamos el controlador ya ensamblado desde nuestra carpeta DI
import clubController from '../DI/club.container.js'; 

const router = Router();

// Rutas genéricas (Heredadas de tu BaseController)
router.get('/', clubController.getAll);
router.get('/:id', clubController.getById);
router.get('/liga/:ligaId', clubController.getByLiga); // Ruta específica para obtener clubes por liga
router.post('/', clubController.create);
router.put('/:id', clubController.update);
router.delete('/:id', clubController.delete);

export default router;