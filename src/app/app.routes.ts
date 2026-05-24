import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/bacheca/bacheca').then(m => m.BachekaComponent),
  },
  {
    path: 'me',
    loadComponent: () => import('./components/photo-grid/photo-grid').then(m => m.PhotoGrid),
    data: { editMode: true },
    canActivate: [authGuard],
  },
  {
    path: 'u/:username',
    loadComponent: () => import('./components/photo-grid/photo-grid').then(m => m.PhotoGrid),
    data: { editMode: false },
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
  },
  { path: 'admin', redirectTo: 'me' },
  { path: '**', redirectTo: '' },
];
