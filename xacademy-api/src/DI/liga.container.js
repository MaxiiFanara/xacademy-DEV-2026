import LigaRepository from '../repositories/liga.repository.js';
import LigaService from '../services/liga.service.js';
import LigaController from '../controllers/liga.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const ligaRepository = new LigaRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const ligaService = new LigaService(ligaRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const ligaController = new LigaController(ligaService);

// 4. Exportamos el controlador listo para conectarse a Express
export default ligaController;