import { inject } from "@angular/core";
import { type HttpInterceptorFn } from "@angular/common/http";
import { from, switchMap } from "rxjs";
import { ClerkService } from "ngx-clerk";

/** Sends the Clerk session token with /api requests when signed in. */
export const clerkTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith("/api/")) return next(req);
  return from(inject(ClerkService).getToken()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};
