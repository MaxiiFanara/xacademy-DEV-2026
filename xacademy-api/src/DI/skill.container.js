import SkillRepository from '../repositories/skill.repository.js';
import SkillService from '../services/skill.service.js';
import SkillController from '../controllers/skill.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const skillRepository = new SkillRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const skillService = new SkillService(skillRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const skillController = new SkillController(skillService);

// 4. Exportamos el controlador listo para conectarse a Express
export default skillController;