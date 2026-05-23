import ClubRepository from '../repositories/club.repository.js';
import ClubService from '../services/club.service.js';
import ClubController from '../controllers/club.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const clubRepository = new ClubRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const clubService = new ClubService(clubRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const clubController = new ClubController(clubService);

// 4. Exportamos el controlador listo para conectarse a Express
export default clubController;