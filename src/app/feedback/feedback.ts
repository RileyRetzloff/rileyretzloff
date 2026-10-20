import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

/**
 * POSTs one piece of anonymous feedback to the site's own API route, which
 * saves it as a GitHub issue in Riley's private feedback repo (and GitHub
 * emails him about it). Needs two Vercel env vars to be set:
 * GITHUB_PSST_ISSUES_READWRITE_TOKEN and GITHUB_PSST_ISSUES_REPO.
 */
async function deliverFeedback(text: string, honeypot: string): Promise<void> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, website: honeypot }),
  });
  if (!res.ok) {
    throw new Error(`feedback delivery failed (${res.status})`);
  }
}

@Component({
  selector: "app-feedback",
  templateUrl: "./feedback.html",
  imports: [FormsModule],
})
export class Feedback {
  protected readonly text = signal("");
  // Honeypot: invisible to humans, irresistible to bots. Never rendered
  // visibly; the server silently drops submissions that fill it.
  protected readonly honeypot = signal("");
  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);
  protected readonly failed = signal(false);

  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
    if (this.submitted()) {
      this.submitted.set(false);
    }
    if (this.failed()) {
      this.failed.set(false);
    }
  }

  protected onHoneypotInput(event: Event): void {
    this.honeypot.set((event.target as HTMLInputElement).value);
  }

  protected async onSubmit(): Promise<void> {
    const value = this.text().trim();
    if (value.length === 0 || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.failed.set(false);
    try {
      await deliverFeedback(value, this.honeypot());
    } catch {
      // Leave the text in place so nothing is lost; the button invites retry.
      this.failed.set(true);
      return;
    } finally {
      this.sending.set(false);
    }
    this.text.set("");
    this.submitted.set(true);
  }
}
