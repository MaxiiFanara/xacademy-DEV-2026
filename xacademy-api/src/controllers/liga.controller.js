// controllers/liga.controller.js
import BaseController from '../core/base.controller.js';

class LigaController extends BaseController {
  constructor(ligaService) {   // ← recibe el servicio inyectado
    super(ligaService);
  }
}

export default LigaController;