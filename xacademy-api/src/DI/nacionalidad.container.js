import NacionalidadRepository from '../repositories/nacionalidad.repository.js';
import NacionalidadService from '../services/nacionalidad.service.js';
import NacionalidadController from '../controllers/nacionalidad.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const nacionalidadRepository = new NacionalidadRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const nacionalidadService = new NacionalidadService(nacionalidadRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const nacionalidadController = new NacionalidadController(nacionalidadService);

// 4. Exportamos el controlador listo para conectarse a Express
export default nacionalidadController;