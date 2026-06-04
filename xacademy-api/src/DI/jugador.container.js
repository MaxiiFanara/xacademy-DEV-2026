import JugadorRepository from '../repositories/jugador.repository.js';
import JugadorService from '../services/jugador.service.js';
import JugadorController from '../controllers/jugador.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
export const jugadorRepository = new JugadorRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
export const jugadorService = new JugadorService(jugadorRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const jugadorController = new JugadorController(jugadorService);

// 4. Exportamos el controlador listo para conectarse a Express
export default jugadorController;