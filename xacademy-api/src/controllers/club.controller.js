import BaseController from '../core/base.controller.js';

class ClubController extends BaseController {
  constructor(clubService) {   // ← recibe el servicio inyectado
    super(clubService);
  }
}

export default ClubController;