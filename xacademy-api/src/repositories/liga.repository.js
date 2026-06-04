import BaseRepository from '../core/base.repository.js';
import { LigaModel } from '../db/models/index.js';

class LigaRepository extends BaseRepository {
  constructor() {
    super(LigaModel); 
  }
}

export default LigaRepository;