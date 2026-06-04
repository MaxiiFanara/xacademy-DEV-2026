import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Skill, SkillEvolution } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {

  private readonly API = '/api';

  constructor(private http: HttpClient) {}

  // Obtener listado de skills disponibles para el radar chart y formularios
  getSkills() {
    return this.http.get<Skill[]>(`${this.API}/skill`, {
      withCredentials: true
    });
  }

  // Evolución de una skill específica a lo largo del tiempo
  getSkillEvolution(idJugador: number, skillId: number) {
    return this.http.get<SkillEvolution[]>(
      `${this.API}/jugador/${idJugador}/evolucion`,
      {
        params: new HttpParams().set('skillId', skillId.toString()),
        withCredentials: true
      }
    );
  }
}