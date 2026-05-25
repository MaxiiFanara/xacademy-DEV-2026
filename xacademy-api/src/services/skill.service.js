import BaseService from '../core/base.service.js';

class SkillService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(skillRepository) {
    super(skillRepository);
  }
  async getByTipo(esArquero) {
    if (esArquero === undefined) {
      return await this.repository.findAll();
    }
    return await this.repository.findByTipo(esArquero);
  }
}

export default SkillService;