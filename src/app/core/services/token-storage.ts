
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private readonly ACCESS_TOKEN_KEY = 'auction_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auction_refresh_token';

  /**
   * Store access and refresh tokens.
   */
  saveTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Retrieve access token.
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Retrieve refresh token.
   */
  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check whether an access token exists.
   */
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Clear authentication tokens.
   */
  clearTokens(): void {

  console.log('clearTokens() called');

  console.trace('TOKEN CLEAR CALL STACK');

  sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
}
}
