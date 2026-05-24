import { Injectable } from '@angular/core';
import { Photo } from '../models/photo.model';
import { PhotoStorageAdapter } from './photo-storage.adapter';

@Injectable()
export class LocalStoragePhotoAdapter extends PhotoStorageAdapter {
  private photosKey(username: string): string {
    return `photomat_photos_${username}`;
  }

  private layoutKey(username: string): string {
    return `photomat_layout_${username}`;
  }

  getAll(username: string): Photo[] {
    const raw = localStorage.getItem(this.photosKey(username));
    return raw ? (JSON.parse(raw) as Photo[]) : [];
  }

  save(username: string, photo: Photo): void {
    const photos = this.getAll(username);
    photos.push(photo);
    localStorage.setItem(this.photosKey(username), JSON.stringify(photos));
  }

  delete(username: string, id: string): void {
    const photos = this.getAll(username).filter(p => p.id !== id);
    localStorage.setItem(this.photosKey(username), JSON.stringify(photos));
  }

  getLayout(username: string): (string | null)[] {
    const raw = localStorage.getItem(this.layoutKey(username));
    return raw ? (JSON.parse(raw) as (string | null)[]) : [];
  }

  saveLayout(username: string, layout: (string | null)[]): void {
    localStorage.setItem(this.layoutKey(username), JSON.stringify(layout));
  }

  getById(username: string, photoId: string): Photo | null {
    return this.getAll(username).find(p => p.id === photoId) ?? null;
  }
}
