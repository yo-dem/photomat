import { Photo } from '../models/photo.model';

export abstract class PhotoStorageAdapter {
  abstract getAll(username: string): Photo[];
  abstract save(username: string, photo: Photo): void;
  abstract delete(username: string, id: string): void;
  abstract getLayout(username: string): (string | null)[];
  abstract saveLayout(username: string, layout: (string | null)[]): void;
  abstract getById(username: string, photoId: string): Photo | null;
}
