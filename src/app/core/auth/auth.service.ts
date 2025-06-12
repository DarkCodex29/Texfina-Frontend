import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { Usuario } from '../../models/insumo.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'access_token';
  private userKey = 'current_user';

  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Simulación de login. Reemplazar por llamada HTTP al backend.
   */
  login(username: string, password: string): Observable<boolean> {
    const fakeToken = 'FAKE_JWT_TOKEN';
    const fakeUser: Usuario = {
      id_usuario: 1,
      username,
      id_rol: 'ADMIN',
    };

    return of(true).pipe(
      delay(1000),
      tap(() => {
        localStorage.setItem(this.tokenKey, fakeToken);
        localStorage.setItem(this.userKey, JSON.stringify(fakeUser));
        this._isLoggedIn$.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): Usuario | null {
    const data = localStorage.getItem(this.userKey);
    return data ? (JSON.parse(data) as Usuario) : null;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.id_rol ?? '') : false;
  }
}
