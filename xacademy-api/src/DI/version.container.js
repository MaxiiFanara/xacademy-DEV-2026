import VersionRepository from '../repositories/version.repository.js';
import VersionService from '../services/version.service.js';
import VersionController from '../controllers/version.controller.js';

const versionRepository = new VersionRepository();
const versionService = new VersionService(versionRepository);
const versionController = new VersionController(versionService);

export default versionController;
