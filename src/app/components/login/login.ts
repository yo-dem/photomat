import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly themeService = inject(ThemeService);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Se già autenticato, non mostrare il login
    if (this.auth.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin';
      this.router.navigateByUrl(returnUrl);
    }
  }

  submit(): void {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    this.auth.login(this.username(), this.password()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
