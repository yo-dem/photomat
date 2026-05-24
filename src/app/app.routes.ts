import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/photo-grid/photo-grid').then(m => m.PhotoGrid),
  },
];
