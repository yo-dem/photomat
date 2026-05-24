import { inject, Injectable, signal } from '@angular/core';
import { Photo } from '../models/photo.model';
import { PhotoStorageAdapter } from '../storage/photo-storage.adapter';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly storage = inject(PhotoStorageAdapter);
  readonly photos = signal<Photo[]>(this.storage.getAll());

  add(name: string, dataUrl: string): void {
    const photo: Photo = { id: crypto.randomUUID(), name, dataUrl, createdAt: Date.now() };
    this.storage.save(photo);
    this.photos.update(list => [...list, photo]);
  }

  remove(id: string): void {
    this.storage.delete(id);
    this.photos.update(list => list.filter(p => p.id !== id));
  }
}
