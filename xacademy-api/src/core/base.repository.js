// src/core/BaseRepository.js

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    // En MySQL, Sequelize no devuelve el objeto actualizado automáticamente.
    // Hacemos el update y luego buscamos el registro para devolverlo.
    const [affectedRows] = await this.model.update(data, {
      where: { Id: id } // Asumiendo que tu Primary Key siempre se llama 'Id'
    });

    if (affectedRows === 0) return null;
    return await this.findById(id);
  }

  async delete(id) {
    const deletedRows = await this.model.destroy({
      where: { Id: id }
    });
    return deletedRows > 0; // Devuelve true si se borró, false si no existía
  }
}

export default BaseRepository;