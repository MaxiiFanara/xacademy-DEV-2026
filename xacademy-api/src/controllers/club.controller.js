import BaseController from '../core/base.controller.js';

class ClubController extends BaseController {
  constructor(clubService) {   // ← recibe el servicio inyectado
    super(clubService);
  }

  getAll = async (req, res) => {
    try {
      const { ligaId } = req.query;
      const result = await this.service.getByLiga(ligaId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default ClubController;