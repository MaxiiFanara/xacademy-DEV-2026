import BaseRepository from '../core/base.repository.js';
import { PosicionModel } from '../db/models/index.js';

class PosicionRepository extends BaseRepository {
  constructor() {
    super(PosicionModel); 
  }
}

export default PosicionRepository;