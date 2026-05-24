import { computed, inject, Injectable, signal } from '@angular/core';
import { Photo } from '../models/photo.model';
import { PhotoStorageAdapter } from '../storage/photo-storage.adapter';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly storage = inject(PhotoStorageAdapter);

  readonly currentUsername = signal<string | null>(null);
  readonly photos = signal<Photo[]>([]);
  readonly layout = signal<(string | null)[]>([]);

  readonly displaySlots = computed<(Photo | null)[]>(() => {
    const layout = this.layout();
    const photoMap = new Map(this.photos().map(p => [p.id, p]));

    let lastOccupied = -1;
    for (let i = layout.length - 1; i >= 0; i--) {
      if (layout[i] !== null && photoMap.has(layout[i]!)) {
        lastOccupied = i;
        break;
      }
    }

    const filledRows = Math.ceil(Math.max(lastOccupied + 1, 1) / 3);
    const totalSlots = Math.max(3, filledRows + 1) * 3;

    return Array.from({ length: totalSlots }, (_, i) => {
      const id = i < layout.length ? layout[i] : null;
      return (id && photoMap.get(id)) || null;
    });
  });

  setUser(username: string): void {
    this.currentUsername.set(username);
    this.photos.set(this.storage.getAll(username));
    this.layout.set(this.storage.getLayout(username));
  }

  add(name: string, dataUrl: string, bachekaEligible: boolean): void {
    const username = this.currentUsername();
    if (!username) return;
    const photo: Photo = {
      id: crypto.randomUUID(),
      name,
      dataUrl,
      createdAt: Date.now(),
      owner: username,
      bachekaEligible,
    };
    this.storage.save(username, photo);
    this.photos.update(list => [...list, photo]);

    const layout = this.layout();
    const copy = [...layout];
    const emptyIdx = copy.findIndex(id => id === null);
    if (emptyIdx !== -1) {
      copy[emptyIdx] = photo.id;
    } else {
      copy.push(photo.id);
    }
    this.storage.saveLayout(username, copy);
    this.layout.set(copy);
  }

  remove(id: string): void {
    const username = this.currentUsername();
    if (!username) return;
    this.storage.delete(username, id);
    this.photos.update(list => list.filter(p => p.id !== id));

    const copy = this.layout().map(slotId => (slotId === id ? null : slotId));
    this.storage.saveLayout(username, copy);
    this.layout.set(copy);
  }

  movePhoto(fromSlot: number, toSlot: number): void {
    const username = this.currentUsername();
    if (!username) return;
    const copy = [...this.layout()];
    const maxIdx = Math.max(fromSlot, toSlot);
    while (copy.length <= maxIdx) copy.push(null);
    [copy[fromSlot], copy[toSlot]] = [copy[toSlot], copy[fromSlot]];
    this.storage.saveLayout(username, copy);
    this.layout.set(copy);
  }

  getLastAddedPhoto(): Photo | null {
    const photos = this.photos();
    return photos.length > 0 ? photos[photos.length - 1] : null;
  }
}
