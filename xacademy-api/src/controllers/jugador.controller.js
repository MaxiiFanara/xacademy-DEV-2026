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

  create = async (req, res) => {
    try {
      console.log(req.body);
      const result = await this.service.crearJugador(req.body);
      res.status(201).json(result);
    } catch (error) {
      const clientErrors = [
        'exactamente una posición principal',
        'posiciones repetidas',
        'valores de las skills',
        'calificación no coincide',
        'Ya existe un jugador',
      ];
      const esErrorCliente = clientErrors.some(msg => error.message.includes(msg));
      res.status(esErrorCliente ? 400 : 500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await this.service.actualizarJugador(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    const clientErrors = [
      'no encontrado',
      'exactamente una posición principal',
      'posiciones repetidas',
      'valores de las skills',
      'calificación no coincide',
    ];
    const esErrorCliente = clientErrors.some(msg => error.message.includes(msg));
    res.status(esErrorCliente ? 400 : 500).json({ error: error.message });
  }
};



}

export default JugadorController;