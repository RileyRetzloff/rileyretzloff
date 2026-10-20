import { Component } from "@angular/core";
import { ClerkSignInComponent } from "ngx-clerk";

@Component({
  selector: "app-sign-in-page",
  imports: [ClerkSignInComponent],
  template: `
    <main class="flex justify-center py-10">
      <clerk-sign-in [props]="{ routing: 'path', path: '/sign-in' }" />
    </main>
  `,
})
export class SignInPage {}
