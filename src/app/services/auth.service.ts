import { computed, Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay, tap } from 'rxjs';

const TOKEN_KEY = 'photomat_auth_token';
const USERNAME_KEY = 'photomat_auth_username';

// TODO(backend): replace with http.post<LoginResponse>('/api/auth/login', credentials)
//                and http.post('/api/auth/logout') when the backend is ready.
const MOCK_USERS: { username: string; password: string; token: string }[] = [
  { username: 'admin', password: 'admin', token: 'mock-admin-token' },
  { username: 'guest1', password: 'guest1', token: 'mock-guest1-token' },
  { username: 'guest2', password: 'guest2', token: 'mock-guest2-token' },
];

export interface LoginResponse {
  token: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<string | null>(localStorage.getItem(USERNAME_KEY));
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(username: string, password: string): Observable<LoginResponse> {
    // TODO(backend): return this.http.post<LoginResponse>('/api/auth/login', { username, password })
    //                  .pipe(tap(res => { this.setToken(res.token); this.setUsername(res.username); }));
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!user) {
      return throwError(() => new Error('Credenziali non valide'));
    }
    return of({ token: user.token, username: user.username }).pipe(
      delay(400),
      tap(res => {
        this.setToken(res.token);
        this.setUsername(res.username);
      }),
    );
  }

  logout(): void {
    // TODO(backend): call this.http.post('/api/auth/logout', {}).subscribe()
    this.setToken(null);
    this.setUsername(null);
  }

  private setToken(token: string | null): void {
    token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);
    this._token.set(token);
  }

  private setUsername(username: string | null): void {
    username
      ? localStorage.setItem(USERNAME_KEY, username)
      : localStorage.removeItem(USERNAME_KEY);
    this.currentUser.set(username);
  }
}
