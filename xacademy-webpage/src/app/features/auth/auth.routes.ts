import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { guestGuard } from '../../core/guards/auth-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];