import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BachekaEntry } from '../../models/bacheca-entry.model';
import { AuthService } from '../../services/auth.service';
import { BachekaService } from '../../services/bacheca.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-bacheca',
  imports: [RouterLink],
  templateUrl: './bacheca.html',
  styleUrl: './bacheca.css',
})
export class BachekaComponent {
  protected readonly bachekaService = inject(BachekaService);
  protected readonly auth = inject(AuthService);
  protected readonly themeService = inject(ThemeService);

  protected readonly selectedEntry = signal<BachekaEntry | null>(null);

  openEntry(entry: BachekaEntry): void {
    this.selectedEntry.set(entry);
  }

  closeEntry(): void {
    this.selectedEntry.set(null);
  }

  logout(): void {
    this.auth.logout();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.selectedEntry() !== null && e.key === 'Escape') {
      this.closeEntry();
    }
  }
}
