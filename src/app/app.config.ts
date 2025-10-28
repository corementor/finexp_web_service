import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { httpInterceptorInterceptor } from './pages/apps/security/interceptors/http-interceptor-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      withFetch(), // Use fetch API instead of XMLHttpRequest
      withInterceptors([httpInterceptorInterceptor]) // Add HTTP interceptor
    ),
  ],
};
