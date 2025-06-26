/**
 * Authentication API Service
 * Handles all authentication-related HTTP requests
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
  role: string;
  fechaRegistro: Date;
  lastLogin?: Date;
  preferences: {
    theme: string;
    autoplay: boolean;
    quality: string;
  };
  stats?: {
    totalVideos: number;
    totalViews: number;
    totalSize: number;
    publicVideos: number;
    privateVideos: number;
  };
}

export interface DatosRegistro {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  pais: string;
}

export interface DatosLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: Usuario;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly API_URL = 'http://localhost:3001/api';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private autenticadoSubject = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  // Auto-refresh timer
  private refreshTimer?: any;

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.tokenSubject.next(token);
        this.usuarioSubject.next(user);
        this.autenticadoSubject.next(true);
        this.startTokenRefresh();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Start automatic token refresh
   */
  private startTokenRefresh(): void {
    // Refresh token every 14 minutes (1 minute before expiry)
    this.refreshTimer = timer(14 * 60 * 1000, 14 * 60 * 1000)
      .pipe(
        switchMap(() => this.refreshToken())
      )
      .subscribe({
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.logout();
        }
      });
  }

  /**
   * Stop automatic token refresh
   */
  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    this.tokenSubject.next(null);
    this.usuarioSubject.next(null);
    this.autenticadoSubject.next(false);
    this.stopTokenRefresh();
  }

  /**
   * Store authentication data
   */
  private storeAuthData(user: Usuario, token: string): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.usuarioSubject.next(user);
    this.autenticadoSubject.next(true);
    this.startTokenRefresh();
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): { [key: string]: string } {
    const token = this.tokenSubject.value;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // Public API

  /**
   * Observable for current user
   */
  get usuario$(): Observable<Usuario | null> {
    return this.usuarioSubject.asObservable();
  }

  /**
   * Observable for authentication status
   */
  get autenticado$(): Observable<boolean> {
    return this.autenticadoSubject.asObservable();
  }

  /**
   * Observable for access token
   */
  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Get current user
   */
  get usuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  get estaAutenticado(): boolean {
    return this.autenticadoSubject.value;
  }

  /**
   * Get current access token
   */
  get accessToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Register new user
   */
  registrarUsuario(datos: DatosRegistro): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, datos, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.storeAuthData(response.user, response.accessToken);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  login(datos: DatosLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, datos, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.storeAuthData(response.user, response.accessToken);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.API_URL}/auth/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        const currentUser = this.usuarioSubject.value;
        if (currentUser) {
          this.storeAuthData(currentUser, response.accessToken);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user profile
   */
  obtenerPerfil(): Observable<{ user: Usuario }> {
    return this.http.get<{ user: Usuario }>(`${this.API_URL}/auth/profile`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => {
        this.usuarioSubject.next(response.user);
        localStorage.setItem('userData', JSON.stringify(response.user));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   */
  actualizarPerfil(datos: Partial<Usuario>): Observable<{ message: string; user: Usuario }> {
    return this.http.patch<{ message: string; user: Usuario }>(`${this.API_URL}/auth/profile`, datos, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => {
        this.usuarioSubject.next(response.user);
        localStorage.setItem('userData', JSON.stringify(response.user));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError((error) => {
        // Clear local data even if logout request fails
        this.clearAuthData();
        return this.handleError(error);
      })
    );
  }

  /**
   * Validate email format
   */
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate password strength
   */
  validarPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if user has specific role
   */
  tieneRol(rol: string): boolean {
    const usuario = this.usuarioActual;
    return usuario ? usuario.role === rol : false;
  }

  /**
   * Check if user is admin
   */
  esAdmin(): boolean {
    return this.tieneRol('admin');
  }
}