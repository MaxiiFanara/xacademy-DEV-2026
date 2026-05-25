import BaseController from '../core/base.controller.js';

class JugadorController extends BaseController {
  constructor(jugadorService) {
    super(jugadorService);
  }

  getAll = async (req, res) => {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;

      if (page < 1 || limit < 1) {
        return res.status(400).json({ error: 'page y limit deben ser mayores a 0' });
      }

      const result = await this.service.getAll({ page, limit });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getDetailById(id);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Jugador no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getEvolucionSkill = async (req, res) => {
    try {
      const { id }     = req.params;
      const { skillId } = req.query;

      const result = await this.service.getEvolucionSkill(id, skillId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('No se encontró')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };



}

export default JugadorController;