import { Photo } from './photo.model';

export interface BachekaEntry {
  id: string;
  photoId: string;
  owner: string;
  dataUrl: string;
  publishedAt: number;
}

export interface PendingBachekaPhoto {
  photo: Photo;
  queuedAt: number;
}
