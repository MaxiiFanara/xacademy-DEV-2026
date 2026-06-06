import NacionalidadRepository from '../repositories/nacionalidad.repository.js';
import NacionalidadService from '../services/nacionalidad.service.js';
import NacionalidadController from '../controllers/nacionalidad.controller.js';

const nacionalidadRepository = new NacionalidadRepository();
const nacionalidadService = new NacionalidadService(nacionalidadRepository);
const nacionalidadController = new NacionalidadController(nacionalidadService);

export default nacionalidadController;