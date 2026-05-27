import { PlayerPosition } from './position.model';
import { PlayerSkill } from './skill.model';

// Lo que devuelve la API en el listado de jugadores
export interface Player {
  idJugador: number;
  nombre: string;
  apellido: string;
  edad?: number;
  esHombre: boolean;
  idNacionalidad: number;
  nacionalidad?: string;
  idClub: number;
  club?: string;
  imagenUrl: string;
  calificacion: number;
  version?: string;
  idVersion?: number;
}

// Lo que devuelve la API en el detalle de un jugador
export interface PlayerDetail extends Player {
  fechaNacimiento: string;
  posiciones: PlayerPosition[];
  skills: PlayerSkill[];
}

// Lo que se manda al crear un jugador
export interface PlayerCreateDto {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  esHombre: boolean;
  idNacionalidad: number;
  idUsuarioCreador: number;
  idVersion: number;
  idClub: number;
  imagenUrl: string;
  calificacion: number;
  posiciones: PlayerPosition[];
  skills: PlayerSkill[];
}

// Lo que se manda al editar un jugador
export interface PlayerUpdateDto {
  idJugador: number;
  nombre: string;
  apellido: string;
  idNacionalidad: number;
  idClub: number;
  imagenUrl: string;
  calificacion: number;
  posiciones: PlayerPosition[];
  skills: PlayerSkill[];
}