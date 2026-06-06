import JugadorRepository from '../repositories/jugador.repository.js';
import JugadorService from '../services/jugador.service.js';
import JugadorController from '../controllers/jugador.controller.js';

export const jugadorRepository = new JugadorRepository();
export const jugadorService = new JugadorService(jugadorRepository);
const jugadorController = new JugadorController(jugadorService);

export default jugadorController;