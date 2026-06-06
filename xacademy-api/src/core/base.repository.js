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

  async findByField(field, value, options = {}) {
    return await this.model.findOne({
      where: { [field]: value },
      ...options,
    });
  }

  async findAllByField(field, value, options = {}) {
  return await this.model.findAll({
    where: { [field]: value },
    ...options,
  });
}

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    const [affectedRows] = await this.model.update(data, {
      where: { Id: id }
    });

    if (affectedRows === 0) return null;
    return await this.findById(id);
  }

  async delete(id) {
    const deletedRows = await this.model.destroy({
      where: { Id: id }
    });
    return deletedRows > 0;
  }
}

export default BaseRepository;