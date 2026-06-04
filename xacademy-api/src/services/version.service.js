import BaseService from '../core/base.service.js';

class VersionService extends BaseService {
  // Recibe la dependencia desde afuera (Inyección)
  constructor( versionRepository) {
    super( versionRepository);
  }
}

export default  VersionService;