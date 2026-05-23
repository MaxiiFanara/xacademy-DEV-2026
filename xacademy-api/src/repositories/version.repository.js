import BaseRepository from '../core/base.repository.js';
import { VersionModel } from '../db/models/index.js';

class VersionRepository extends BaseRepository {
  constructor() {
    super(VersionModel); 
  }
}

export default VersionRepository;