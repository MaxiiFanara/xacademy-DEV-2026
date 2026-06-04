import BaseService from '../core/base.service.js';

class ClubService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(clubRepository) {
    super(clubRepository);
  }

  async getByLiga(ligaId) {
    if (!ligaId) return await this.repository.findAll();
    return await this.repository.findByLiga(ligaId);
  }
}

export default ClubService;