import BaseRepository from '../core/base.repository.js';
import { sequelize } from '../db/connection.js';
import { 
  JugadorModel, 
  VwListadoJugadores, 
  VwDetalleJugador, 
  VwEvolucionSkillJugador, 
  VersionJugadorModel,
  VersionJugadorPosicionModel,
  VersionJugadorSkillModel,
  NacionalidadModel,
  ClubModel,
  VersionModel,
  PosicionModel,
  SkillModel
} from '../db/models/index.js';
  import { Op } from 'sequelize';

class JugadorRepository extends BaseRepository {
constructor() {
    super(JugadorModel);
  }

async findAll({ page = 1, limit = 20, versionId, esHombre, idUsuarioCreador, idUsuarioLogueado } = {}) {
  const offset = (page - 1) * limit;
  const where = {};

  if (versionId !== undefined) where.IdVersion = versionId;
  if (esHombre !== undefined) where.EsHombre = esHombre === 'true' || esHombre === true;

  if (idUsuarioCreador !== undefined) {
    where.IdUsuarioCreador = idUsuarioCreador;
  } else {
    where[Op.or] = [
      { EsDelJuegoBase: 1 },
      { IdUsuarioCreador: idUsuarioLogueado }
    ];
  }

  const { count, rows } = await VwListadoJugadores.findAndCountAll({
    where, limit, offset,
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    perPage: limit,
    data: rows,
  };
}
async findAllExport({ versionId, esHombre, idUsuarioCreador, idUsuarioLogueado } = {}) {
  const where = {};

  if (versionId !== undefined) where.IdVersion = versionId;
  if (esHombre !== undefined) where.EsHombre = esHombre === 'true' || esHombre === true;

  if (idUsuarioCreador !== undefined) {
    where.IdUsuarioCreador = idUsuarioCreador;
  } else {
    where[Op.or] = [
      { EsDelJuegoBase: 1 },
      { IdUsuarioCreador: idUsuarioLogueado }
    ];
  }

  return await VwListadoJugadores.findAll({ where });
}

// En el repository agregá este método
async findPosicionesByVersionJugador(idVersionJugador) {
  return await VersionJugadorPosicionModel.findAll({
    where: { IdVersionJugador: idVersionJugador }
  });
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

  async getTrayectoria(idJugador) {
  return await VwEvolucionSkillJugador.findAll({
    where: { IdJugador: idJugador },
    order: [['AnioJuego', 'ASC'], ['Skill', 'ASC']],
  });
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

async actualizarCompleto({ idVersionJugador, jugador, versionJugador, posiciones, skills }) {
  const t = await sequelize.transaction();
  try {
    // Obtener el IdJugador real desde VersionJugador
    const version = await VersionJugadorModel.findOne({
      where: { Id: idVersionJugador },
      transaction: t,
    });
    if (!version) throw new Error('VersionJugador no encontrada');

    // 1. Actualizar tabla Jugador con el ID real obtenido de la BD
    await JugadorModel.update(jugador, {
      where: { Id: version.IdJugador },
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

async importRow(row, cache) {
  const idNacionalidad = cache.nacionalidades[row.nacionalidad?.toLowerCase()];
  const idClub = cache.clubs[row.club?.toLowerCase()];
  const idVersion = cache.versiones[row.version?.toLowerCase()];
  const idPosicion = cache.posiciones[row.posicionPrincipal?.toLowerCase()];

  if (!idNacionalidad || !idClub || !idVersion || !idPosicion) {
    throw new Error(`Datos no encontrados: nacionalidad=${row.nacionalidad}, club=${row.club}, version=${row.version}, posicion=${row.posicionPrincipal}`);
  }

  const t = await sequelize.transaction();
  try {
    let jugador = await JugadorModel.findOne({
      where: {
        Nombre: row.nombre,
        Apellido: row.apellido,
        FechaNacimiento: row.fechaNacimiento || null,
      },
      transaction: t,
    });

    if (!jugador) {
      jugador = await JugadorModel.create({
        Nombre: row.nombre,
        Apellido: row.apellido,
        FechaNacimiento: row.fechaNacimiento || null,
        EsHombre: row.esHombre === 'true' || row.esHombre === true,
        EsRetirado: false,
        AnioRetiro: null,
        EsDelJuegoBase: true,
        EsActivo: true,
        IdNacionalidad: idNacionalidad,
        IdUsuarioCreador: null,
      }, { transaction: t });
    }

    let versionJugador = await VersionJugadorModel.findOne({
      where: { IdJugador: jugador.Id, IdVersion: idVersion },
      transaction: t,
    });

    if (!versionJugador) {
      versionJugador = await VersionJugadorModel.create({
        IdJugador: jugador.Id,
        IdVersion: idVersion,
        IdClub: idClub,
        ImagenPath: null,
        Calificacion: parseInt(row.calificacion) || 0,
      }, { transaction: t });
    } else {
      await VersionJugadorModel.update({
        IdClub: idClub,
        Calificacion: parseInt(row.calificacion) || 0,
      }, {
        where: { Id: versionJugador.Id },
        transaction: t,
      });
    }

    await VersionJugadorPosicionModel.destroy({
      where: { IdVersionJugador: versionJugador.Id },
      transaction: t,
    });
    await VersionJugadorPosicionModel.create({
      IdVersionJugador: versionJugador.Id,
      IdPosicion: idPosicion,
      EsPrincipal: true,
    }, { transaction: t });

    const skillNames = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY', 'DIV', 'HAN', 'KIC', 'REF', 'SPE', 'POS'];
    const skillsData = skillNames
      .filter(name => row[name] !== undefined && row[name] !== '')
      .map(name => {
        const skill = cache.skills[name.toLowerCase()];
        if (!skill) return null;
        return {
          IdVersionJugador: versionJugador.Id,
          IdSkill: skill.id,
          Valor: parseInt(row[name]) || 0,
        };
      })
      .filter(Boolean);

    if (skillsData.length > 0) {
      await VersionJugadorSkillModel.destroy({
        where: { IdVersionJugador: versionJugador.Id },
        transaction: t,
      });
      await VersionJugadorSkillModel.bulkCreate(skillsData, { transaction: t });
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async loadCache() {
  const [nacs, clubs, vers, poss, skills] = await Promise.all([
    NacionalidadModel.findAll(),
    ClubModel.findAll(),
    VersionModel.findAll(),
    PosicionModel.findAll(),
    SkillModel.findAll(),
  ]);

  const cache = {
    nacionalidades: {},
    clubs: {},
    versiones: {},
    posiciones: {},
    skills: {},
  };

  nacs.forEach(n => cache.nacionalidades[n.Nombre.toLowerCase()] = n.Id);
  clubs.forEach(c => cache.clubs[c.Nombre.toLowerCase()] = c.Id);
  vers.forEach(v => cache.versiones[v.Nombre.toLowerCase()] = v.Id);
  poss.forEach(p => cache.posiciones[p.Nombre.toLowerCase()] = p.Id);
  skills.forEach(s => cache.skills[s.Nombre.toLowerCase()] = { id: s.Id, esArquero: s.EsArquero });

  return cache;
}
}

export default JugadorRepository;