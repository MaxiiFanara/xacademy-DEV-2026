import BaseService from '../core/base.service.js';

class JugadorService extends BaseService {
constructor(jugadorRepository) {
    super(jugadorRepository);
  }

  async getAll({ page, limit } = {}) {
    return await this.repository.findAll({ page, limit });
  }

  async getDetailById(id) {
    const rows = await this.repository.findDetailById(id);

    if (!rows || rows.length === 0) {
      throw new Error('Jugador no encontrado');
    }

    // Todas las filas tienen los mismos datos base, tomamos la primera
    const base = rows[0];

    // Agrupamos las skills en labels y skillsData para Chart.js
    const labels     = rows.map(r => r.Skill);
    const skillsData = rows.map(r => r.ValorSkill);

    return {
      juego:            base.Juego,
      nombre:           base.Nombre,
      apellido:         base.Apellido,
      nacionalidad:     base.Nacionalidad,
      club:             base.Club,
      calificacion:     base.Calificacion,
      labels,
      skillsData,
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


  async crearJugador(body) {
    const {
      nombre, apellido, fechaNacimiento, esHombre,
      idNacionalidad, idUsuarioCreador,
      idVersion, idClub, imagenUrl,
      posiciones, skills, calificacion,
    } = body;

    // 1. Validar que haya exactamente una posición principal
    const principales = posiciones.filter(p => p.esPrincipal);
    if (principales.length !== 1) {
      throw new Error('Debe haber exactamente una posición principal');
    }

    // 2. Validar que no haya posiciones repetidas
    const idsPosicion = posiciones.map(p => p.idPosicion);
    if (new Set(idsPosicion).size !== idsPosicion.length) {
      throw new Error('No puede haber posiciones repetidas');
    }

    // 3. Validar skills entre 0 y 99
    const skillsInvalidas = skills.filter(s => s.valor < 0 || s.valor > 99);
    if (skillsInvalidas.length > 0) {
      throw new Error('Los valores de las skills deben estar entre 0 y 99');
    }

    // 4. Verificar y revalidar calificación
    const calificacionCalculada = Math.round(
      skills.reduce((sum, s) => sum + s.valor, 0) / skills.length
    );
    if (calificacionCalculada !== calificacion) {
      throw new Error('La calificación no coincide con el promedio de las skills');
    }

    // 5. Verificar duplicado
    const duplicado = await this.repository.existeDuplicado(nombre, apellido, fechaNacimiento);
    if (duplicado) {
      throw new Error('Ya existe un jugador con ese nombre, apellido y fecha de nacimiento');
    }

    // 6. Ejecutar transacción
    return await this.repository.crearCompleto({
      jugador: {
  Nombre:           nombre,
  Apellido:         apellido,
  FechaNacimiento:  fechaNacimiento || null,
  EsHombre:         esHombre,
  EsRetirado:       false,        // ← explícito
  AnioRetiro:       null,         // ← explícito
  EsDelJuegoBase:   false,        // ← explícito
  EsActivo:         true,         // ← explícito
  IdNacionalidad:   idNacionalidad,
  IdUsuarioCreador: idUsuarioCreador || null,
},
      versionJugador: {
        IdVersion:    idVersion,
        IdClub:       idClub,
        ImagenUrl:    imagenUrl || null,
        Calificacion: calificacionCalculada,
      },
      posiciones,
      skills,
    });
  }

async actualizarJugador(idVersionJugador, body) {
  const {
    nombre, apellido, idNacionalidad,
    idClub, imagenUrl,
    posiciones, skills, calificacion,
    idJugador,
  } = body;

  // 1. Verificar que existe
const versionExiste = await this.repository.findVersionJugadorById(idVersionJugador);
  if (!versionExiste) throw new Error('Jugador no encontrado');

  // 2. Validar exactamente una posición principal
  const principales = posiciones.filter(p => p.esPrincipal);
  if (principales.length !== 1) {
    throw new Error('Debe haber exactamente una posición principal');
  }

  // 3. Validar posiciones sin repetir
  const idsPosicion = posiciones.map(p => p.idPosicion);
  if (new Set(idsPosicion).size !== idsPosicion.length) {
    throw new Error('No puede haber posiciones repetidas');
  }

  // 4. Validar skills entre 0 y 99
  const skillsInvalidas = skills.filter(s => s.valor < 0 || s.valor > 99);
  if (skillsInvalidas.length > 0) {
    throw new Error('Los valores de las skills deben estar entre 0 y 99');
  }

  // 5. Revalidar calificación
  const calificacionCalculada = Math.round(
    skills.reduce((sum, s) => sum + s.valor, 0) / skills.length
  );
  if (calificacionCalculada !== calificacion) {
    throw new Error('La calificación no coincide con el promedio de las skills');
  }

  return await this.repository.actualizarCompleto({
    idVersionJugador,
    idJugador,
    jugador: {
      Nombre:        nombre,
      Apellido:      apellido,
      IdNacionalidad: idNacionalidad,
    },
    versionJugador: {
      IdClub:       idClub,
      ImagenUrl:    imagenUrl || null,
      Calificacion: calificacionCalculada,
    },
    posiciones,
    skills,
  });
}
}

export default JugadorService;