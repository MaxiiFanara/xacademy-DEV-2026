import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Player, PlayerDetail, PlayerCreateDto, PlayerUpdateDto } from '../models/player.model';
import { Version } from '../models/version.model';

export interface PlayerFilters {
  esHombre?: boolean;
  versionId?: number;
  creadoPorMi?: boolean;
  page?: number;
}

export interface PaginatedPlayers {
  data: Player[];
  total: number;
  page: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private readonly API = 'http://localhost:8080/api/jugador';
  private readonly VERSION_API = 'http://localhost:8080/api/version';

  // Signal con la lista de jugadores actual
  players = signal<Player[]>([]);

  // Signal con el jugador en detalle
  selectedPlayer = signal<PlayerDetail | null>(null);

  constructor(private http: HttpClient) {}

  // Obtener listado con filtros opcionales y paginación
  getPlayers(filters: PlayerFilters = {}) {
    let params = new HttpParams();

    if (filters.esHombre !== undefined) {
      params = params.set('esHombre', filters.esHombre.toString());
    }
    if (filters.versionId !== undefined) {
      params = params.set('versionId', filters.versionId.toString());
    }
    if (filters.creadoPorMi) {
      params = params.set('creadoPorMi', 'true');
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }

    return this.http.get<PaginatedPlayers>(this.API, {
      params,
      withCredentials: true
    });
  }

  // Obtener detalle de un jugador por ID de VersionJugador
  getPlayerById(id: number) {
    return this.http.get<PlayerDetail>(`${this.API}/${id}`, {
      withCredentials: true
    });
  }

  // Crear jugador
  createPlayer(dto: PlayerCreateDto) {
    return this.http.post<PlayerDetail>(this.API, dto, {
      withCredentials: true
    });
  }

  // Editar jugador — id es el ID de VersionJugador
  updatePlayer(id: number, dto: PlayerUpdateDto) {
    return this.http.put<PlayerDetail>(`${this.API}/${id}`, dto, {
      withCredentials: true
    });
  }

  // Evolución de una skill a lo largo del tiempo
  // idJugador es el ID de la tabla Jugador (no VersionJugador)
  getSkillEvolution(idJugador: number, skillId: number) {
    return this.http.get(`${this.API}/${idJugador}/evolucion`, {
      params: new HttpParams().set('skillId', skillId.toString()),
      withCredentials: true
    });
  }

  // Obtener versiones FIFA disponibles
  getVersions() {
    return this.http.get<Version[]>(this.VERSION_API, {
      withCredentials: true
    });
  }
}