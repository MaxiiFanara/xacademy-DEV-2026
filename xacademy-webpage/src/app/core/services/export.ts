import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(players: Player[], filename: string = 'jugadores') {
    const data = players.map(p => ({
      'Nombre': p.Nombre,
      'Apellido': p.Apellido,
      'Género': p.EsHombre ? 'Masculino' : 'Femenino',
      'Nacionalidad': p.Nacionalidad,
      'Club': p.Club,
      'Posición': p.PosicionPrincipal,
      'Calificación': p.Calificacion,
      'Versión FIFA': p.Juego
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');
    XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
  }
}