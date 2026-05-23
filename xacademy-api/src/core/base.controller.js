// src/core/BaseController.js

class BaseController {
  constructor(service) {
    this.service = service;
  }

  getAll = async (req, res) => {
    try {
      const records = await this.service.getAll();
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const record = await this.service.getById(id);
      res.status(200).json(record);
    } catch (error) {
      if (error.message === 'Registro no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const data = req.body;
      const newRecord = await this.service.create(data);
      res.status(201).json(newRecord); // 201 = Created
    } catch (error) {
      res.status(400).json({ error: error.message }); // 400 = Bad Request (suele ser error de validación de Sequelize)
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedRecord = await this.service.update(id, data);
      res.status(200).json(updatedRecord);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
}

export default BaseController;