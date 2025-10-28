import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth-service';
import { environment } from '../../../../environment/environment';

export const httpInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the request URL is in the whitelist (no token needed)
  const isWhitelisted = environment.tokenWhitelist.some((url) => req.url.includes(url));

  // Clone the request and add authorization header if not whitelisted
  let authReq = req;
  if (!isWhitelisted) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token expired or invalid
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Access forbidden:', error);
      } else if (error.status === 0) {
        // Network error
        console.error('Network error:', error);
      }

      return throwError(() => error);
    })
  );
};
