import { computed, inject, Injectable } from "@angular/core";
import { httpResource } from "@angular/common/http";
import { ClerkService } from "ngx-clerk";

/** What the API makes of the current user (see api/me.js). */
interface Me {
  signedIn: boolean;
  userId: string | null;
  contributor: boolean;
}

@Injectable({ providedIn: "root" })
export class Session {
  private readonly clerk = inject(ClerkService);

  /** Refetched whenever a different user signs in. Idle while signed out. */
  private readonly me = httpResource<Me>(() => (this.clerk.userId() ? "/api/me" : undefined));

  readonly userId = this.clerk.userId;
  readonly contributor = computed(() => this.me.hasValue() && this.me.value().contributor);
  readonly loading = computed(() => !this.clerk.isLoaded() || this.me.isLoading());
}
