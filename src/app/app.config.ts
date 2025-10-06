// import {
//   ApplicationConfig,
//   provideBrowserGlobalErrorListeners,
//   provideZoneChangeDetection,
// } from '@angular/core';
// import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
//   ],
// };

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(), // Allows route params as component inputs
      withViewTransitions() // Smooth page transitions
    ),
    provideHttpClient(
      withFetch() // Use fetch API instead of XMLHttpRequest
      // withInterceptors([]) // Add your interceptors here
    ),
  ],
};
