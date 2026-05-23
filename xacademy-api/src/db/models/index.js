// src/models/index.js
import PosicionModel from './posicion.model.js';
import NacionalidadModel from './nacionalidad.model.js';
import VersionModel from './version.model.js';
import SkillModel from './skill.model.js';
import LigaModel from './liga.model.js';
import ClubModel from './club.model.js';
import UsuarioModel from './usuario.model.js';
import JugadorModel from './jugador.model.js';
import VersionJugadorModel from './versionJugador.model.js';
import VersionJugadorPosicionModel from './versionJugadorPosicion.model.js';
import VersionJugadorSkillModel from './versionJugadorSkill.model.js';
import {VwListadoJugadores} from './VwListadoJugadores.js';
// ============================================================
// CONFIGURACIÓN DE ASOCIACIONES (Relaciones)
// Si más adelante necesitas definir las relaciones (hasMany, belongsTo),
// el lugar ideal para centralizarlas y ejecutarlas es aquí abajo.
// ============================================================

export {
  PosicionModel,
  NacionalidadModel,
  VersionModel,
  SkillModel,
  LigaModel,
  ClubModel,
  UsuarioModel,
  JugadorModel,
  VersionJugadorModel,
  VersionJugadorPosicionModel,
  VersionJugadorSkillModel,
  VwListadoJugadores,
};