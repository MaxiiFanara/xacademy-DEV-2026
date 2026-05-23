import BaseController from '../core/base.controller.js';

class PosicionController extends BaseController {
  constructor(posicionService) {   // ← recibe el servicio inyectado
    super(posicionService);
  }
}

export default PosicionController;