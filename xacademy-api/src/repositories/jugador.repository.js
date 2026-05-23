import BaseRepository from '../core/base.repository.js';
import { JugadorModel,VwListadoJugadores } from '../db/models/index.js';

class JugadorRepository extends BaseRepository {
constructor() {
    super(JugadorModel);
  }

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const { count, rows } = await VwListadoJugadores.findAndCountAll({
      limit,
      offset,
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      perPage: limit,
      data: rows,
    };
  }
}

export default JugadorRepository;