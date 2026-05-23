import BaseService from '../core/base.service.js';

class AuthService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(authRepository) {
    super(authRepository);
  }
}

export default AuthService;