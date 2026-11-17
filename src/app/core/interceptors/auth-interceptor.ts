
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpContextToken
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth';
import { TokenStorageService } from '../services/token-storage';

// Indicates whether the original request has already been retried.
const RETRIED = new HttpContextToken<boolean>(() => false);

// Result shared with requests waiting for token refresh.
type RefreshResult =
  | { success: true; token: string }
  | { success: false; error: unknown };

// Coordinates simultaneous token refresh requests.
let refreshTokenSubject =
  new BehaviorSubject<RefreshResult | null>(null);

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.endsWith('/auth/login') ||
    req.url.endsWith('/auth/register') ||
    req.url.endsWith('/auth/refresh');

  // Do not attach JWT to login, registration or refresh requests.
  const accessToken = tokenStorage.getAccessToken();

  const authRequest =
    accessToken && !isAuthEndpoint
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      : req;

  return next(authRequest).pipe(

    catchError((error: HttpErrorResponse) => {

      // Handle only unauthorized responses from protected APIs.
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      // The retried request also failed authentication.
      // The current session can no longer be trusted.
      if (req.context.get(RETRIED)) {
        tokenStorage.clearTokens();
        router.navigate(['/login']);

        return throwError(() => error);
      }

      const refreshToken = tokenStorage.getRefreshToken();

      // No refresh token means the session cannot be renewed.
      if (!refreshToken) {
        tokenStorage.clearTokens();
        router.navigate(['/login']);

        return throwError(() => error);
      }

      // Another request is already refreshing the token.
      if (isRefreshing) {

        return refreshTokenSubject.pipe(

          filter(
            (result): result is RefreshResult => result !== null
          ),

          take(1),

          switchMap(result => {

            // Propagate the refresh failure to waiting requests.
            if (!result.success) {
              return throwError(() => result.error);
            }

            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${result.token}`
              },
              context: req.context.set(RETRIED, true)
            });

            return next(retryRequest);
          })
        );
      }

      // Start a new refresh operation.
      isRefreshing = true;

      // Create a fresh subject for this refresh cycle.
      refreshTokenSubject =
        new BehaviorSubject<RefreshResult | null>(null);

      
return authService.refreshToken().pipe(

  // Handle errors from the refresh API only.
  catchError(refreshError => {

    tokenStorage.clearTokens();

    refreshTokenSubject.next({
      success: false,
      error: refreshError
    });

    router.navigate(['/login']);

    return throwError(() => refreshError);
  }),

  switchMap(response => {

    const newAccessToken = response.accessToken;

    // Notify all waiting requests.
    refreshTokenSubject.next({
      success: true,
      token: newAccessToken
    });

    // Retry the original request.
    const retryRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${newAccessToken}`
      },
      context: req.context.set(RETRIED, true)
    });

    return next(retryRequest);
  }),

  finalize(() => {
    isRefreshing = false;
  })
);

    })
  );
};
