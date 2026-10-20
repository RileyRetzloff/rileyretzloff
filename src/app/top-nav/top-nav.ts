import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  ClerkSignInButtonDirective,
  ClerkSignedInDirective,
  ClerkSignedOutDirective,
  ClerkUserButtonComponent,
} from "ngx-clerk";

// The middle one is literally U+FFFD, per Riley. Yes, really.
const FEEDBACK_LINK_LABELS = ["⍰", "�", "⸮"];

function pickLabel(): string {
  // Non-empty by construction, so the index always hits.
  return FEEDBACK_LINK_LABELS[
    Math.floor(Math.random() * FEEDBACK_LINK_LABELS.length)
  ]!;
}

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
  protected readonly feedbackLabel = pickLabel();
}
