import BaseRepository from '../core/base.repository.js';
import { JugadorModel,VwListadoJugadores,VwDetalleJugador,VwEvolucionSkillJugador} from '../db/models/index.js';

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

  async findDetailById(id) {
    const rows = await VwDetalleJugador.findAll({
      where: { IdVersionJugador: id },
    });
    return rows;  // devuelve las N filas crudas, el service las agrupa
  }

   async findEvolucionSkill(idJugador, idSkill) {
    const rows = await VwEvolucionSkillJugador.findAll({
      where: { IdJugador: idJugador, IdSkill: idSkill },
      order: [['AnioJuego', 'ASC']],
    });
    return rows;
  }



}

export default JugadorRepository;