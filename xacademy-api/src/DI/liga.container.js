import LigaRepository from '../repositories/liga.repository.js';
import LigaService from '../services/liga.service.js';
import LigaController from '../controllers/liga.controller.js';

const ligaRepository = new LigaRepository();
const ligaService = new LigaService(ligaRepository);
const ligaController = new LigaController(ligaService);

export default ligaController;