import BaseRepository from '../core/base.repository.js';
import { sequelize } from '../db/connection.js';
import { JugadorModel,VwListadoJugadores,VwDetalleJugador,VwEvolucionSkillJugador,VersionJugadorModel,
  VersionJugadorPosicionModel,
  VersionJugadorSkillModel,} from '../db/models/index.js';

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

  // src/repositories/jugador.repository.js
async findVersionJugadorById(idVersionJugador) {
  return await VersionJugadorModel.findOne({
    where: { Id: idVersionJugador },
  });
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

   async existeDuplicado(nombre, apellido, fechaNacimiento) {
    const { Op } = await import('sequelize');
    return await JugadorModel.findOne({
      where: { Nombre: nombre, Apellido: apellido, FechaNacimiento: fechaNacimiento },
    });
  }

  async crearCompleto({ jugador, versionJugador, posiciones, skills }) {
    const t = await sequelize.transaction();
    try {
      // 1. Insertar en Jugador
      const nuevoJugador = await JugadorModel.create(jugador, { transaction: t });

      // 2. Insertar en VersionJugador
      const nuevaVersion = await VersionJugadorModel.create(
        { ...versionJugador, IdJugador: nuevoJugador.Id },
        { transaction: t }
      );

      // 3. Insertar posiciones
      const posicionesData = posiciones.map(p => ({
        IdVersionJugador: nuevaVersion.Id,
        IdPosicion:       p.idPosicion,
        EsPrincipal:      p.esPrincipal,
      }));
      await VersionJugadorPosicionModel.bulkCreate(posicionesData, { transaction: t });

      // 4. Insertar skills
      const skillsData = skills.map(s => ({
        IdVersionJugador: nuevaVersion.Id,
        IdSkill:          s.idSkill,
        Valor:            s.valor,
      }));
      await VersionJugadorSkillModel.bulkCreate(skillsData, { transaction: t });

      await t.commit();
      return { jugador: nuevoJugador, versionJugador: nuevaVersion };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async actualizarCompleto({ idVersionJugador, idJugador, jugador, versionJugador, posiciones, skills }) {
  const t = await sequelize.transaction();
  try {
    // 1. Actualizar tabla Jugador
    await JugadorModel.update(jugador, {
      where: { Id: idJugador },
      transaction: t,
    });

    // 2. Actualizar tabla VersionJugador
    await VersionJugadorModel.update(versionJugador, {
      where: { Id: idVersionJugador },
      transaction: t,
    });

    // 3. Reemplazar posiciones — DELETE + INSERT
    await VersionJugadorPosicionModel.destroy({
      where: { IdVersionJugador: idVersionJugador },
      transaction: t,
    });
    await VersionJugadorPosicionModel.bulkCreate(
      posiciones.map(p => ({
        IdVersionJugador: idVersionJugador,
        IdPosicion:       p.idPosicion,
        EsPrincipal:      p.esPrincipal,
      })),
      { transaction: t }
    );

    // 4. Reemplazar skills — DELETE + INSERT
    await VersionJugadorSkillModel.destroy({
      where: { IdVersionJugador: idVersionJugador },
      transaction: t,
    });
    await VersionJugadorSkillModel.bulkCreate(
      skills.map(s => ({
        IdVersionJugador: idVersionJugador,
        IdSkill:          s.idSkill,
        Valor:            s.valor,
      })),
      { transaction: t }
    );

    await t.commit();
    return { message: 'Jugador actualizado correctamente' };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}


}

export default JugadorRepository;