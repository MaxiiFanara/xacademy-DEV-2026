import VersionRepository from '../repositories/version.repository.js';
import VersionService from '../services/version.service.js';
import VersionController from '../controllers/version.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const versionRepository = new VersionRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const versionService = new VersionService(versionRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const versionController = new VersionController(versionService);

// 4. Exportamos el controlador listo para conectarse a Express
export default versionController;