import { Component, output, signal } from '@angular/core';
import { PlayerFilters as PlayerFiltersType } from '../../../core/services/player';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';

@Component({
  selector: 'app-player-filters',
  imports: [ButtonModule, ButtonGroupModule],
  templateUrl: './player-filters.html',
  styleUrl: './player-filters.scss'
})
export class PlayerFilters {

  filterChange = output<PlayerFiltersType>();
  activeFilter = signal<string>('todos');

  showAll() {
    this.activeFilter.set('todos');
    this.filterChange.emit({});
  }

  showMale() {
    this.activeFilter.set('masculino');
    this.filterChange.emit({ esHombre: true });
  }

  showFemale() {
    this.activeFilter.set('femenino');
    this.filterChange.emit({ esHombre: false });
  }

  showMyPlayers() {
    this.activeFilter.set('míos');
    this.filterChange.emit({ creadoPorMi: true });
  }
}