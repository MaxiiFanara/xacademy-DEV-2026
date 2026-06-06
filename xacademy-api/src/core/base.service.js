class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll(options = {}) {
    return await this.repository.findAll(options);
  }

  async getById(id, options = {}) {
    const record = await this.repository.findById(id, options);
    if (!record) {
      throw new Error('Registro no encontrado');
    }
    return record;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async update(id, data) {
    const updatedRecord = await this.repository.update(id, data);
    if (!updatedRecord) {
      throw new Error('Registro no encontrado para actualizar');
    }
    return updatedRecord;
  }

  async delete(id) {
    const isDeleted = await this.repository.delete(id);
    if (!isDeleted) {
      throw new Error('Registro no encontrado para eliminar');
    }
    return true;
  }
}

export default BaseService;