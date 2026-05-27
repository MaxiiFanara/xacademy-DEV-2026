import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService, PlayerFilters } from '../../../core/services/player';
import { Player } from '../../../core/models/player.model';

// Componentes propios
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { PlayerTable } from '../player-table/player-table';
import { PlayerFilters as PlayerFiltersComponent } from '../player-filters/player-filters';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-players-list',
  imports: [
    Navbar,
    Footer,
    PlayerTable,
    PlayerFiltersComponent,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './players-list.html',
  styleUrl: './players-list.scss'
})
export class PlayersList implements OnInit {

  private playerService = inject(PlayerService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  players = signal<Player[]>([]);
  loading = signal(false);
  currentFilters = signal<PlayerFilters>({});

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers(filters: PlayerFilters = {}) {
    this.loading.set(true);
    this.playerService.getPlayers(filters).subscribe({
      next: (res) => {
        this.players.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el listado de jugadores'
        });
      }
    });
  }

  onFilterChange(filters: PlayerFilters) {
    this.currentFilters.set(filters);
    this.loadPlayers(filters);
  }

  onViewDetail(id: number) {
    this.router.navigate(['/players', id]);
  }

  onEdit(id: number) {
    this.router.navigate(['/players', id, 'edit']);
  }

  openCreateModal() {
    // lo implementamos cuando hagamos el player-form
  }
}