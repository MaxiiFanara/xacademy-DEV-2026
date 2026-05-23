import BaseController from '../core/base.controller.js';

class SkillController extends BaseController {
  constructor(skillService) {   // ← recibe el servicio inyectado
    super(skillService);
  }
}

export default SkillController;