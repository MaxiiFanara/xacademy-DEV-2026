import {jugadorRepository, jugadorService} from './jugador.container.js';
import IAController from '../controllers/ia.controller.js';
import IAService from '../services/ia.service.js';

const iaService = new IAService();
const iaController = new IAController(jugadorService, iaService);

export default iaController;