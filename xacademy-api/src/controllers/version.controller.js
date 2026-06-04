import BaseController from '../core/base.controller.js';

class VersionController extends BaseController {
  constructor(versionService) {   // ← recibe el servicio inyectado
    super(versionService);
  }
}

export default VersionController;
