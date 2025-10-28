import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../../../../common/dto/util/auth-response';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login user
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.API}/security/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response && response.accessToken) {
            this.setSession(response);
          }
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.API}/security/auth/register`, userData).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          this.setSession(response);
        }
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    return !this.isTokenExpired(token);
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${environment.API}/security/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          if (response && response.accessToken) {
            this.setSession(response);
          }
        })
      );
  }

  /**
   * Set session data
   */
  private setSession(authResponse: AuthResponse): void {
    if (authResponse.accessToken) {
      localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);
    }
    if (authResponse.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    }

    const userInfo = {
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
    this.currentUserSubject.next(authResponse);
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): AuthResponse | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return Math.floor(new Date().getTime() / 1000) >= expiry;
    } catch {
      return true;
    }
  }
}
