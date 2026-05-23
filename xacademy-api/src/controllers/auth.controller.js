import BaseController from '../core/base.controller.js';

class AuthController extends BaseController {
  constructor(authService) {   // ← recibe el servicio inyectado
    super(authService);
  }
}

export default AuthController;