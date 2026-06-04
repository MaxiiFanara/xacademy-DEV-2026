import BaseService from '../core/base.service.js';

class JugadorService extends BaseService {
constructor(jugadorRepository) {
    super(jugadorRepository);
  }

async getAll({ page, limit, versionId, esHombre, creadoPorMi, usuario } = {}) {
  let idUsuarioCreador;
  if (creadoPorMi === 'true' || creadoPorMi === true) {
    idUsuarioCreador = usuario.Id;
  }

  return await this.repository.findAll({
    page, limit, versionId, esHombre,
    idUsuarioCreador,
    idUsuarioLogueado: usuario.Id
  });
}

async exportAll({ versionId, esHombre, creadoPorMi, usuario } = {}) {
  let idUsuarioCreador;
  if (creadoPorMi === 'true' || creadoPorMi === true) {
    idUsuarioCreador = usuario.Id;
  }

  return await this.repository.findAllExport({
    versionId, esHombre,
    idUsuarioCreador,
    idUsuarioLogueado: usuario.Id
  });
}
async getIdJugador(idVersionJugador) {
  const versionJugador = await this.repository.findVersionJugadorById(idVersionJugador);
  if (!versionJugador) throw new Error('Version de jugador no encontrada');
  return { IdJugador: versionJugador.IdJugador };
}

async getDetailById(id) {
  const [rows, posiciones] = await Promise.all([
    this.repository.findDetailById(id),
    this.repository.findPosicionesByVersionJugador(id)
  ]);

  if (!rows || rows.length === 0) throw new Error('Jugador no encontrado');

  const base = rows[0];
  const labels = rows.map(r => r.Skill);
  const skillsData = rows.map(r => r.ValorSkill);
  const skills = rows.map(r => ({
    idSkill: r.IdSkill,
    valor: r.ValorSkill,
    nombre: r.Skill,
  }));

  return {
    idJugador:      base.IdJugador,
    juego:          base.Juego,
    nombre:         base.Nombre,
    apellido:       base.Apellido,
    idNacionalidad: base.IdNacionalidad,
    nacionalidad:   base.Nacionalidad,
    idClub:         base.IdClub,
    club:           base.Club,
    idLiga:         base.IdLiga,
    imagenUrl:      base.ImagenUrl,
    calificacion:   base.Calificacion,
    labels,
    skillsData,
    skills,
    posiciones: posiciones.map(p => ({
      idPosicion:  p.IdPosicion,
      esPrincipal: p.EsPrincipal
    }))
  };
}





  async getEvolucionSkill(idJugador, idSkill) {
    if (!idSkill) {
      throw new Error('El parámetro skillId es requerido');
    }

    const rows = await this.repository.findEvolucionSkill(idJugador, idSkill);

    if (!rows || rows.length === 0) {
      throw new Error('No se encontró evolución para ese jugador y habilidad');
    }

    return rows.map(r => ({
      anio:  r.AnioJuego,
      juego: r.Juego,
      valor: r.ValorSkill,
    }));
  }


_validatePlayerData(posiciones, skills, calificacion) {
  const principales = posiciones.filter(p => p.esPrincipal);
  if (principales.length !== 1) throw new Error('Debe haber exactamente una posición principal');

  const idsPosicion = posiciones.map(p => p.idPosicion);
  if (new Set(idsPosicion).size !== idsPosicion.length) throw new Error('No puede haber posiciones repetidas');

  const skillsInvalidas = skills.filter(s => s.valor < 0 || s.valor > 99);
  if (skillsInvalidas.length > 0) throw new Error('Los valores de las skills deben estar entre 0 y 99');

  const calificacionCalculada = Math.round(
    skills.reduce((sum, s) => sum + s.valor, 0) / skills.length
  );
  if (calificacionCalculada !== parseInt(calificacion)) throw new Error('La calificación no coincide con el promedio de las skills');

  return calificacionCalculada;
}

async create(body, usuarioActivo) {
  const {
    nombre, apellido, fechaNacimiento, esHombre,
    idNacionalidad, idVersion, idClub, imagenPath,
    posiciones, skills, calificacion,
  } = body;

  const calificacionCalculada = this._validatePlayerData(posiciones, skills, calificacion);

  const duplicado = await this.repository.existeDuplicado(nombre, apellido, fechaNacimiento);
  if (duplicado) throw new Error('Ya existe un jugador con ese nombre, apellido y fecha de nacimiento');

  return await this.repository.crearCompleto({
    jugador: {
      Nombre:           nombre,
      Apellido:         apellido,
      FechaNacimiento:  fechaNacimiento || null,
      EsHombre:         esHombre === 'true' || esHombre === true,
      EsRetirado:       false,
      AnioRetiro:       null,
      EsDelJuegoBase:   false,
      EsActivo:         true,
      IdNacionalidad:   idNacionalidad,
      IdUsuarioCreador: usuarioActivo.Id,
    },
    versionJugador: {
      IdVersion:    idVersion,
      IdClub:       idClub,
      ImagenPath:   imagenPath || null,
      Calificacion: calificacionCalculada,
    },
    posiciones,
    skills,
  });
}

async getTrajectory(idJugador) {
  return await this.repository.getTrayectoria(idJugador);
}

async update(idVersionJugador, body) {
  const {
    nombre, apellido, idNacionalidad,
    idClub, imagenPath,
    posiciones, skills, calificacion,
  } = body;

  const versionExiste = await this.repository.findVersionJugadorById(idVersionJugador);
  if (!versionExiste) throw new Error('Jugador no encontrado');

  const calificacionCalculada = this._validatePlayerData(posiciones, skills, calificacion);

  // Si no se subió nueva imagen, mantener la existente
  const imagenActual = imagenPath || versionExiste.ImagenPath || null;

  return await this.repository.actualizarCompleto({
    idVersionJugador,
    jugador: {
      Nombre:         nombre,
      Apellido:       apellido,
      IdNacionalidad: idNacionalidad,
    },
    versionJugador: {
      IdClub:       idClub,
      ImagenPath:   imagenActual,
      Calificacion: calificacionCalculada,
    },
    posiciones,
    skills,
  });
}

async importFromCsv(csvContent) {
  const { parse } = await import('csv-parse/sync');

  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const cache = await this.repository.loadCache();

  let procesados = 0;
  let errores = 0;
  const detalles = [];

  for (const row of rows) {
    try {
      await this.repository.importRow(row, cache);
      procesados++;
      detalles.push({ nombre: row.nombre, apellido: row.apellido, estado: 'ok' });
    } catch (error) {
      errores++;
      detalles.push({ nombre: row.nombre, apellido: row.apellido, estado: 'error', mensaje: error.message });
    }
  }

  return { total: rows.length, procesados, errores, detalles };
}


}

export default JugadorService;