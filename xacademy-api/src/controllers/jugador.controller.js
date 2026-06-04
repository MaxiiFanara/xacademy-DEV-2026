import BaseController from '../core/base.controller.js';
import logger from '../config/winston.js';

class JugadorController extends BaseController {
  constructor(jugadorService) {
    super(jugadorService);
  }

getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { versionId, esHombre, creadoPorMi } = req.query;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: 'page y limit deben ser mayores a 0' });
    }

    const result = await this.service.getAll({
      page,
      limit,
      versionId,
      esHombre,
      creadoPorMi,
      usuario: req.user,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getDetailById(id);
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      if (error.message === 'Jugador no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

exportAll = async (req, res) => {
  try {
    const { versionId, esHombre, creadoPorMi } = req.query;
    const data = await this.service.exportAll({
      versionId,
      esHombre,
      creadoPorMi,
      usuario: req.user
    });
    res.status(200).json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

  getIdJugador = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await this.service.getIdJugador(id);
    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    res.status(404).json({ error: error.message });
  }
};

  getEvolucionSkill = async (req, res) => {
    try {
      const { id }     = req.params;
      const { skillId } = req.query;

      const result = await this.service.getEvolucionSkill(id, skillId);
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      if (error.message.includes('requerido') || error.message.includes('No se encontró')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

create = async (req, res) => {
  try {
    // Si se subió una imagen, agregar la ruta al body
    if (req.file) {
      req.body.imagenPath = `/img/${req.file.filename}`;
    }

    const result = await this.service.create(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    logger.error(error);
    const clientErrors = [
      'exactamente una posición principal',
      'posiciones repetidas',
      'valores de las skills',
      'calificación no coincide',
      'Ya existe un jugador',
      'Solo se permiten imágenes en formato WebP',
    ];
    const esErrorCliente = clientErrors.some(msg => error.message.includes(msg));
    res.status(esErrorCliente ? 400 : 500).json({ error: error.message });
  }
};

update = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.file) {
      req.body.imagenPath = `/img/${req.file.filename}`;
    }

    const result = await this.service.update(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    const clientErrors = [
      'no encontrado',
      'exactamente una posición principal',
      'posiciones repetidas',
      'valores de las skills',
      'calificación no coincide',
      'Solo se permiten imágenes en formato WebP',
    ];
    const esErrorCliente = clientErrors.some(msg => error.message.includes(msg));
    res.status(esErrorCliente ? 400 : 500).json({ error: error.message });
  }
};

importCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo CSV' });
    }
    const csvContent = req.file.buffer.toString('utf-8');
    const result = await this.service.importFromCsv(csvContent);
    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

}

export default JugadorController;