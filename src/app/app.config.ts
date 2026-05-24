import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { PhotoStorageAdapter } from './storage/photo-storage.adapter';
import { LocalStoragePhotoAdapter } from './storage/local-storage-photo.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: PhotoStorageAdapter, useClass: LocalStoragePhotoAdapter },
  ],
};
