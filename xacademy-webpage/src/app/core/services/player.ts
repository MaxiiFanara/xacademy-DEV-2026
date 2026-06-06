import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Player, PlayerDetailData, PlayerCreateDto, PlayerUpdateDto, PaginatedPlayers, PlayerFilters } from '../models/player.model';
import { Version } from '../models/version.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private readonly API = '/api/jugador';
  private readonly VERSION_API = '/api/version';

  players = signal<Player[]>([]);

  selectedPlayer = signal<PlayerDetailData | null>(null);

  constructor(private http: HttpClient) {}

exportPlayers(filters: PlayerFilters = {}) {
  let params = new HttpParams();
  if (filters.esHombre !== undefined) params = params.set('esHombre', filters.esHombre.toString());
  if (filters.versionId !== undefined) params = params.set('versionId', filters.versionId.toString());
  if (filters.creadoPorMi) params = params.set('creadoPorMi', 'true');

  return this.http.get<Player[]>(`${this.API}/export`, { params, withCredentials: true });
}

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

 getPlayerById(id: number) {
  return this.http.get<PlayerDetailData>(`${this.API}/${id}`, {
    withCredentials: true
  });
}

getPlayerAnalysis(idVersionJugador: number) {
  return this.http.get<{ analisis: string }>(`/api/ia/jugador/${idVersionJugador}/analisis`, {
    withCredentials: true
  });
}

 createPlayer(formData: FormData) {
  return this.http.post<any>(this.API, formData, {
    withCredentials: true
  });
}
importCsv(formData: FormData) {
  return this.http.post<any>(`${this.API}/import`, formData, {
    withCredentials: true
  });
}

updatePlayer(id: number, formData: FormData) {
  return this.http.put<any>(`${this.API}/${id}`, formData, {
    withCredentials: true
  });
}

  getSkillEvolution(idJugador: number, skillId: number) {
    return this.http.get(`${this.API}/${idJugador}/evolucion`, {
      params: new HttpParams().set('skillId', skillId.toString()),
      withCredentials: true
    });
  }

  getVersions() {
    return this.http.get<Version[]>(this.VERSION_API, {
      withCredentials: true
    });
  }
}