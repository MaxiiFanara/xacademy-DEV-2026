import BaseController from '../core/base.controller.js';

class NacionalidadController extends BaseController {
  constructor(nacionalidadService) {   // ← recibe el servicio inyectado
    super(nacionalidadService);
  }
}

export default NacionalidadController;
