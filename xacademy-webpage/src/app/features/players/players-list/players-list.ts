import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService, PlayerFilters } from '../../../core/services/player';
import { Player } from '../../../core/models/player.model';

import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { PlayerTable } from '../player-table/player-table';
import { PlayerFilters as PlayerFiltersComponent } from '../player-filters/player-filters';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { PlayerForm } from '../player-form/player-form';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-players-list',
  imports: [
    Navbar, Footer, PlayerTable, PlayerFiltersComponent,
    LoadingSpinner, PlayerForm, ButtonModule, ToastModule, DialogModule
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
  showCreateDialog = signal(false);
  totalRecords = signal(0);
  totalPages = signal(1);
  currentPage = signal(1);
  currentFilters = signal<PlayerFilters>({});

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers(filters: PlayerFilters = {}, page: number = 1) {
    this.loading.set(true);
    this.playerService.getPlayers({ ...filters, page }).subscribe({
      next: (res) => {
        this.players.set(res.data);
        this.totalRecords.set(res.total);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.currentPage);
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
    this.loadPlayers(filters, 1);
  }

  onPageChange(page: number) {
    this.loadPlayers(this.currentFilters(), page);
  }

  onViewDetail(id: number) {
    this.router.navigate(['/players', id]);
  }

  onEdit(id: number) {
    this.router.navigate(['/players', id, 'edit']);
  }

  openCreateDialog() {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.loadPlayers(this.currentFilters(), this.currentPage());
  }
}