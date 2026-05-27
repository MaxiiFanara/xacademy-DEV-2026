import { Component, input, output } from '@angular/core';
import { Player } from '../../../core/models/player.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-player-table',
  imports: [TableModule, ButtonModule, TagModule],
  templateUrl: './player-table.html',
  styleUrl: './player-table.scss'
})
export class PlayerTable {

  // input() es la forma moderna de Angular 20 en vez de @Input()
  players = input<Player[]>([]);
  loading = input<boolean>(false);

  // output() en vez de @Output() EventEmitter
  viewDetail = output<number>();
  edit = output<number>();

  onViewDetail(id: number) {
    this.viewDetail.emit(id);
  }

  onEdit(id: number) {
    this.edit.emit(id);
  }
}