import { computed, Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay, tap } from 'rxjs';

const TOKEN_KEY = 'photomat_auth_token';

// TODO(backend): replace with http.post<LoginResponse>('/api/auth/login', credentials)
//                and http.post('/api/auth/logout') when the backend is ready.
// The LoginResponse shape { token: string } matches a standard JWT response.
const MOCK_USER = { username: 'admin', password: 'admin' };
const MOCK_TOKEN = 'mock-admin-token';

export interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(username: string, password: string): Observable<LoginResponse> {
    // TODO(backend): return this.http.post<LoginResponse>('/api/auth/login', { username, password })
    //                  .pipe(tap(res => this.setToken(res.token)));
    if (username !== MOCK_USER.username || password !== MOCK_USER.password) {
      return throwError(() => new Error('Credenziali non valide'));
    }
    return of({ token: MOCK_TOKEN }).pipe(
      delay(400),
      tap(res => this.setToken(res.token)),
    );
  }

  logout(): void {
    // TODO(backend): call this.http.post('/api/auth/logout', {}).subscribe()
    this.setToken(null);
  }

  private setToken(token: string | null): void {
    token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);
    this._token.set(token);
  }
}
