import BaseService from '../core/base.service.js';

class LigaService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(ligaRepository) {
    super(ligaRepository);
  }
}

export default LigaService;