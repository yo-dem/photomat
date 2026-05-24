import { Photo } from '../models/photo.model';

export abstract class PhotoStorageAdapter {
  abstract getAll(): Photo[];
  abstract save(photo: Photo): void;
  abstract delete(id: string): void;
  abstract getLayout(): (string | null)[];
  abstract saveLayout(layout: (string | null)[]): void;
}
