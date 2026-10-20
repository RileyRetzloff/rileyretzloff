import { Component } from "@angular/core";
import { ClerkSignUpComponent } from "ngx-clerk";

@Component({
  selector: "app-sign-up-page",
  imports: [ClerkSignUpComponent],
  template: `
    <main class="flex justify-center py-10">
      <clerk-sign-up [props]="{ routing: 'path', path: '/sign-up' }" />
    </main>
  `,
})
export class SignUpPage {}
