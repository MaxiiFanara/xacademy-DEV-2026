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
  players = input<Player[]>([]);
  loading = input<boolean>(false);
  totalRecords = input<number>(0);
  currentPage = input<number>(1);
  totalPages = input<number>(1);

  viewDetail = output<number>();
  edit = output<number>();
  pageChange = output<number>();

  onViewDetail(id: number) { this.viewDetail.emit(id); }
  onEdit(id: number) { this.edit.emit(id); }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.pageChange.emit(page);
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}