import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Nacionalidad } from '../models/nacionalidad.model';
import { Liga } from '../models/liga.model';
import { Club } from '../models/club.model';
import { Position } from '../models/position.model';
import { Skill } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class FormDataService {

  constructor(private http: HttpClient) {}

  getNacionalidades() {
    return this.http.get<Nacionalidad[]>('/api/nacionalidad', { withCredentials: true });
  }

  getLigas() {
    return this.http.get<Liga[]>('/api/liga', { withCredentials: true });
  }

  getClubsByLiga(idLiga: number) {
    return this.http.get<Club[]>(`/api/club/liga/${idLiga}`, { withCredentials: true });
  }

  getPosiciones() {
    return this.http.get<Position[]>('/api/posicion', { withCredentials: true });
  }

  getSkills() {
    return this.http.get<Skill[]>('/api/skill', { withCredentials: true });
  }
}