import { Injectable } from '@angular/core';
import { Photo } from '../models/photo.model';
import { PhotoStorageAdapter } from './photo-storage.adapter';

const STORAGE_KEY = 'photomat_photos';

@Injectable()
export class LocalStoragePhotoAdapter extends PhotoStorageAdapter {
  getAll(): Photo[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Photo[]) : [];
  }

  save(photo: Photo): void {
    const photos = this.getAll();
    photos.push(photo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }

  delete(id: string): void {
    const photos = this.getAll().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }
}
