import SkillRepository from '../repositories/skill.repository.js';
import SkillService from '../services/skill.service.js';
import SkillController from '../controllers/skill.controller.js';

const skillRepository = new SkillRepository();
const skillService = new SkillService(skillRepository);
const skillController = new SkillController(skillService);

export default skillController;