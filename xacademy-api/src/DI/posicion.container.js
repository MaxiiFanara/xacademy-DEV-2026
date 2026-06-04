import PosicionRepository from '../repositories/posicion.repository.js';
import PosicionService from '../services/posicion.service.js';
import PosicionController from '../controllers/posicion.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const posicionRepository = new PosicionRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const posicionService = new PosicionService(posicionRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const posicionController = new PosicionController(posicionService);

// 4. Exportamos el controlador listo para conectarse a Express
export default posicionController;