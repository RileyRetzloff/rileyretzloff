import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  ClerkSignInButtonDirective,
  ClerkSignedInDirective,
  ClerkSignedOutDirective,
  ClerkUserButtonComponent,
} from "ngx-clerk";
import { pickRandom } from "../random";

@Component({
  selector: "app-top-nav",
  imports: [
    RouterLink,
    ClerkUserButtonComponent,
    ClerkSignedInDirective,
    ClerkSignedOutDirective,
    ClerkSignInButtonDirective,
  ],
  templateUrl: "./top-nav.html",
})
export class TopNav {
  // The middle one is U+FFFD (the replacement character), on purpose.
  protected readonly feedbackLabel = pickRandom(["⍰", "�", "⸮"]);
}
