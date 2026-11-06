import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { CLERK_OPTIONS, ClerkService, type ClerkInitOptions } from "ngx-clerk";
import { routes } from "./app.routes";
import { clerkTokenInterceptor } from "./auth/clerk-token.interceptor";
import { environment } from "../environments/environment";

const clerkOptions: ClerkInitOptions = {
  publishableKey: environment.clerkPublishableKey,
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([clerkTokenInterceptor])),
    // Not ngx-clerk's provideClerk(): it holds up bootstrap until Clerk's
    // script loads, so a slow or blocked Clerk CDN meant a blank site. Clerk's
    // guards, directives and components all wait for ClerkService.isLoaded,
    // so load it in the background instead.
    { provide: CLERK_OPTIONS, useValue: clerkOptions },
    provideAppInitializer(() => {
      inject(ClerkService).initialize(clerkOptions).catch(console.error);
    }),
  ],
};
