import { Routes } from '@angular/router';
import { PlayersList } from './players-list/players-list';
import { PlayerDetail } from './player-detail/player-detail';
import { PlayerForm } from './player-form/player-form';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    component: PlayersList
  },
  {
    path: ':id',
    component: PlayerDetail
  },
  {
    path: ':id/edit',
    component: PlayerForm
  }
];