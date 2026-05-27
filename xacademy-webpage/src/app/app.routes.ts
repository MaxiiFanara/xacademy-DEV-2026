import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'players',
    canActivate: [authGuard],
    loadChildren: () => import('./features/players/players.routes').then(m => m.PLAYERS_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];