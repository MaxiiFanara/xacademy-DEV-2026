import PosicionRepository from '../repositories/posicion.repository.js';
import PosicionService from '../services/posicion.service.js';
import PosicionController from '../controllers/posicion.controller.js';

const posicionRepository = new PosicionRepository();
const posicionService = new PosicionService(posicionRepository);
const posicionController = new PosicionController(posicionService);

export default posicionController;