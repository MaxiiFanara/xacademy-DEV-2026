import BaseService from '../core/base.service.js';

class ClubService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(clubRepository) {
    super(clubRepository);
  }
}

export default ClubService;