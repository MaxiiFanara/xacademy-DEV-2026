import BaseService from '../core/base.service.js';

class SkillService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor(skillRepository) {
    super(skillRepository);
  }
}

export default SkillService;