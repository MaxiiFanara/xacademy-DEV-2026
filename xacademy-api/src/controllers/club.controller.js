import BaseController from '../core/base.controller.js';
import logger from '../config/winston.js';

class ClubController extends BaseController {
  constructor(clubService) {
    super(clubService);
  }

  getAll = async (req, res) => {
    try {
      const { ligaId } = req.query;
      const result = await this.service.getByLiga(ligaId);
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: error.message });
    }
  };

  getByLiga = async (req, res) => {
    try {
      const { ligaId } = req.params;
      const result = await this.service.getByLiga(ligaId);
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: error.message });
    }
}
}
export default ClubController;
