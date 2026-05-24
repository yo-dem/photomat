import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/photo-grid/photo-grid').then(m => m.PhotoGrid),
    data: { editMode: false },
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/photo-grid/photo-grid').then(m => m.PhotoGrid),
    data: { editMode: true },
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
  },
  { path: '**', redirectTo: '' },
];
