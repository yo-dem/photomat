import { computed, Injectable, signal } from '@angular/core';
import { BachekaEntry, PendingBachekaPhoto } from '../models/bacheca-entry.model';
import { Photo } from '../models/photo.model';

const BACHECA_KEY = 'photomat_bacheca';
const PENDING_KEY = 'photomat_bacheca_pending';

const ONE_HOUR_MS = 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * ONE_HOUR_MS;
const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;

@Injectable({ providedIn: 'root' })
export class BachekaService {
  readonly entries = signal<BachekaEntry[]>(this.loadEntries());
  private readonly pending = signal<PendingBachekaPhoto[]>(this.loadPending());

  readonly activeEntries = computed<BachekaEntry[]>(() => {
    const now = Date.now();
    return this.entries()
      .filter(e => now - e.publishedAt < FORTY_EIGHT_HOURS_MS)
      .sort((a, b) => b.publishedAt - a.publishedAt);
  });

  constructor() {
    this.processQueue();
    setInterval(() => this.processQueue(), 60_000);
  }

  submitPhoto(photo: Photo): 'published' | 'queued' {
    if (this.canPublishNow(photo.owner)) {
      this.publish(photo);
      return 'published';
    } else {
      this.enqueue(photo);
      return 'queued';
    }
  }

  getOpacity(entry: BachekaEntry): number {
    const age = Date.now() - entry.publishedAt;
    if (age <= TWENTY_FOUR_HOURS_MS) return 1.0;
    const fadeProgress = (age - TWENTY_FOUR_HOURS_MS) / TWENTY_FOUR_HOURS_MS;
    return Math.max(0.1, 1.0 - fadeProgress * 0.9);
  }

  pendingCountForUser(username: string): number {
    return this.pending().filter(p => p.photo.owner === username).length;
  }

  nextPublishTimeForUser(username: string): Date | null {
    const lastEntry = this.entries()
      .filter(e => e.owner === username)
      .sort((a, b) => b.publishedAt - a.publishedAt)[0];
    if (!lastEntry) return null;
    const next = lastEntry.publishedAt + ONE_HOUR_MS;
    if (next <= Date.now()) return null;
    return new Date(next);
  }

  processQueue(): void {
    const pending = this.pending();
    if (pending.length === 0) return;

    const byUser = new Map<string, PendingBachekaPhoto[]>();
    for (const item of pending) {
      const list = byUser.get(item.photo.owner) ?? [];
      list.push(item);
      byUser.set(item.photo.owner, list);
    }

    let updated = false;
    for (const [username, items] of byUser) {
      if (this.canPublishNow(username)) {
        const oldest = items.sort((a, b) => a.queuedAt - b.queuedAt)[0];
        this.publish(oldest.photo);
        const remaining = this.pending().filter(p => p !== oldest);
        this.pending.set(remaining);
        this.savePending(remaining);
        updated = true;
      }
    }
  }

  private canPublishNow(username: string): boolean {
    const lastEntry = this.entries()
      .filter(e => e.owner === username)
      .sort((a, b) => b.publishedAt - a.publishedAt)[0];
    if (!lastEntry) return true;
    return Date.now() - lastEntry.publishedAt >= ONE_HOUR_MS;
  }

  private publish(photo: Photo): void {
    const entry: BachekaEntry = {
      id: crypto.randomUUID(),
      photoId: photo.id,
      owner: photo.owner,
      dataUrl: photo.dataUrl,
      publishedAt: Date.now(),
    };
    const updated = [entry, ...this.entries()];
    this.entries.set(updated);
    this.saveEntries(updated);
  }

  private enqueue(photo: Photo): void {
    const item: PendingBachekaPhoto = { photo, queuedAt: Date.now() };
    const updated = [...this.pending(), item];
    this.pending.set(updated);
    this.savePending(updated);
  }

  private loadEntries(): BachekaEntry[] {
    const raw = localStorage.getItem(BACHECA_KEY);
    return raw ? (JSON.parse(raw) as BachekaEntry[]) : [];
  }

  private loadPending(): PendingBachekaPhoto[] {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingBachekaPhoto[]) : [];
  }

  private saveEntries(entries: BachekaEntry[]): void {
    localStorage.setItem(BACHECA_KEY, JSON.stringify(entries));
  }

  private savePending(pending: PendingBachekaPhoto[]): void {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }
}
