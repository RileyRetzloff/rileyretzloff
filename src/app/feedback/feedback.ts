import { Component, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";

/** Anonymous feedback, which api/feedback.js files as a GitHub issue. */
@Component({
  selector: "app-feedback",
  imports: [FormsModule],
  templateUrl: "./feedback.html",
})
export class Feedback {
  private readonly http = inject(HttpClient);

  protected readonly text = signal("");
  protected readonly honeypot = signal("");
  protected readonly status = signal<"idle" | "sending" | "sent" | "failed">("idle");

  protected async submit(): Promise<void> {
    this.status.set("sending");
    try {
      await firstValueFrom(
        this.http.post("/api/feedback", { text: this.text().trim(), website: this.honeypot() }),
      );
      this.text.set("");
      this.status.set("sent");
    } catch {
      // Keep the text so nothing is lost; the button invites a retry.
      this.status.set("failed");
    }
  }
}
