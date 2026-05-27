import BaseRepository from '../core/base.repository.js';
import { SkillModel } from '../db/models/index.js';

class SkillRepository extends BaseRepository {
  constructor() {
    super(SkillModel); 
  }

   async findByTipo(esArquero) {
    const valor = esArquero === 'true' || esArquero === true;
    return await this.findAllByField('EsArquero', valor);
  }
}

export default SkillRepository;