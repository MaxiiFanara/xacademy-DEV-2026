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


}

export default JugadorService;