import { computed, inject, Injectable, signal } from '@angular/core';
import { Photo } from '../models/photo.model';
import { PhotoStorageAdapter } from '../storage/photo-storage.adapter';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly storage = inject(PhotoStorageAdapter);
  readonly photos = signal<Photo[]>(this.storage.getAll());
  readonly layout = signal<(string | null)[]>(this.storage.getLayout());

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

  add(name: string, dataUrl: string): void {
    const photo: Photo = { id: crypto.randomUUID(), name, dataUrl, createdAt: Date.now() };
    this.storage.save(photo);
    this.photos.update(list => [...list, photo]);

    const layout = this.layout();
    const copy = [...layout];
    const emptyIdx = copy.findIndex(id => id === null);
    if (emptyIdx !== -1) {
      copy[emptyIdx] = photo.id;
    } else {
      copy.push(photo.id);
    }
    this.storage.saveLayout(copy);
    this.layout.set(copy);
  }

  remove(id: string): void {
    this.storage.delete(id);
    this.photos.update(list => list.filter(p => p.id !== id));

    const copy = this.layout().map(slotId => (slotId === id ? null : slotId));
    this.storage.saveLayout(copy);
    this.layout.set(copy);
  }

  movePhoto(fromSlot: number, toSlot: number): void {
    const copy = [...this.layout()];
    const maxIdx = Math.max(fromSlot, toSlot);
    while (copy.length <= maxIdx) copy.push(null);
    [copy[fromSlot], copy[toSlot]] = [copy[toSlot], copy[fromSlot]];
    this.storage.saveLayout(copy);
    this.layout.set(copy);
  }
}
