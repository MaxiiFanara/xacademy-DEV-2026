import { PlayerPosition } from './position.model';
import { PlayerSkill } from './skill.model';

export interface Player {
  IdVersionJugador: number;
  IdJugador: number;
  IdVersion: number;
  EsHombre: boolean;
  IdUsuarioCreador: number | null;
  Juego: string;
  Foto: string;
  Nombre: string;
  Apellido: string;
  Nacionalidad: string;
  Club: string;
  PosicionPrincipal: string;
  Calificacion: number;
}

export interface PaginatedPlayers {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  data: Player[];
}


export interface PlayerDetailData {
  juego: string;
  nombre: string;
  apellido: string;
  idNacionalidad: number;
  nacionalidad: string;
  idClub: number;
  club: string;
  idLiga: number;
  imagenUrl: string;
  calificacion: number;
  labels: string[];
  skillsData: number[];
  skills: { idSkill: number; valor: number; nombre: string }[];
  posiciones: { idPosicion: number; esPrincipal: boolean }[];
}

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