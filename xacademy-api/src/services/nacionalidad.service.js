import BaseService from '../core/base.service.js';

class NacionalidadService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(nacionalidadRepository) {
    super(nacionalidadRepository);
  }
}

export default NacionalidadService;