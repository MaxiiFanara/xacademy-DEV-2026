import BaseRepository from '../core/base.repository.js';
import { ClubModel } from '../db/models/index.js';

class ClubRepository extends BaseRepository {
  constructor() {
    super(ClubModel); 
  }
}

export default ClubRepository;