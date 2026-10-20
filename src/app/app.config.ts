import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClerk } from 'ngx-clerk';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClerk({
      publishableKey: environment.clerkPublishableKey,
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    })
  ]
};
