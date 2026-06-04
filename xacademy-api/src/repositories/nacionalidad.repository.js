import BaseRepository from '../core/base.repository.js';
import { NacionalidadModel } from '../db/models/index.js';

class NacionalidadRepository extends BaseRepository {
  constructor() {
    super(NacionalidadModel); 
  }
}

export default NacionalidadRepository;