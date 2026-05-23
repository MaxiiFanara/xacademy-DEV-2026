import BaseRepository from '../core/base.repository.js';
import { SkillModel } from '../db/models/index.js';

class SkillRepository extends BaseRepository {
  constructor() {
    super(SkillModel); 
  }
}

export default SkillRepository;