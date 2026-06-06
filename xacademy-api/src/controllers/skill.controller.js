import BaseController from '../core/base.controller.js';
import logger from '../config/winston.js';

class SkillController extends BaseController {
  constructor(skillService) {
    super(skillService);
  }

   getAll = async (req, res) => {
    try {
      const { esArquero } = req.query;
      const result = await this.service.getByTipo(esArquero);
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: error.message });
    }
  };
}

export default SkillController;
