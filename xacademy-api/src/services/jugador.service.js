import BaseService from '../core/base.service.js';

class JugadorService extends BaseService {
constructor(jugadorRepository) {
    super(jugadorRepository);
  }

  async getAll({ page, limit } = {}) {
    return await this.repository.findAll({ page, limit });
  }
}

export default JugadorService;