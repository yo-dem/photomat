import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'default' | 'modern';

const THEMES: Theme[] = ['default', 'modern'];
const STORAGE_KEY = 'photomat_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly theme = signal<Theme>(this.loadSaved());

  constructor() {
    this.apply(this.theme());
  }

  cycle(): void {
    const next = THEMES[(THEMES.indexOf(this.theme()) + 1) % THEMES.length];
    this.theme.set(next);
    localStorage.setItem(STORAGE_KEY, next);
    this.apply(next);
  }

  private apply(theme: Theme): void {
    this.doc.documentElement.setAttribute('data-theme', theme);
  }

  private loadSaved(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return THEMES.includes(saved!) ? saved! : 'modern'; // parte col tema chiaro
  }
}
