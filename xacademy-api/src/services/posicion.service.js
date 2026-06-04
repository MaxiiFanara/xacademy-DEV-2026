import BaseService from '../core/base.service.js';

class PosicionService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(posicionRepository) {
    super(posicionRepository);
  }
}

export default PosicionService;