
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { LoginRequest } from '../models/auth/login-request.model';
import { JwtResponse } from '../models/auth/jwt-response.model';
import { ApiResponse } from '../models/api-response.model';
import { TokenStorageService } from './token-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly tokenStorage = inject(TokenStorageService);

  private readonly authUrl = `${API_CONFIG.BASE_URL}/auth`;

  /**
   * Authenticate user and store generated tokens.
   */
  login(request: LoginRequest): Observable<JwtResponse> {

    return this.http.post<JwtResponse>(
      `${this.authUrl}/login`,
      request
    ).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(
          response.accessToken,
          response.refreshToken
        );
      })
    );
  }

  /**
   * Refresh access token and rotate refresh token.
   */
  refreshToken(): Observable<JwtResponse> {

    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('Refresh token not found.');
    }

    return this.http.post<JwtResponse>(
      `${this.authUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(
          response.accessToken,
          response.refreshToken
        );
      })
    );
  }

  /**
   * Logout user and revoke refresh token.
   */
  logout(): Observable<ApiResponse> {
    console.log("logout method called")
  const refreshToken = this.tokenStorage.getRefreshToken();

  if (!refreshToken) {
    this.tokenStorage.clearTokens();

    return new Observable<ApiResponse>(subscriber => {
      subscriber.next({
        success: true,
        message: 'Logged out locally.'
      });
      subscriber.complete();
    });
  }

  return this.http.post<ApiResponse>(
    `${this.authUrl}/logout`,
    { refreshToken }
  ).pipe(
    tap(() => {
      this.tokenStorage.clearTokens();
    }),
    catchError(error => {
      this.tokenStorage.clearTokens();
      return throwError(() => error);
    })
  );
}

  /**
   * Check whether access token exists.
   */
  isAuthenticated(): boolean {
    return this.tokenStorage.hasAccessToken();
  }
}
