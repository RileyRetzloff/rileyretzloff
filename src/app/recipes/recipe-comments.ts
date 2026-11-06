import { Component, inject, input, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { RecipesApi, type RecipeComment } from "./recipes";

/** Conversation under a recipe. Anyone can post; no account needed. */
@Component({
  selector: "app-recipe-comments",
  imports: [DatePipe, FormsModule],
  templateUrl: "./recipe-comments.html",
})
export class RecipeComments {
  private readonly api = inject(RecipesApi);

  readonly slug = input.required<string>();

  protected readonly comments = httpResource<RecipeComment[]>(
    () => `/api/recipes/${this.slug()}/comments`,
    { defaultValue: [] },
  );

  protected readonly name = signal("");
  protected readonly text = signal("");
  protected readonly honeypot = signal("");
  protected readonly sending = signal(false);
  protected readonly failed = signal(false);

  protected async submit(): Promise<void> {
    this.sending.set(true);
    this.failed.set(false);
    try {
      const comment = await this.api.addComment(this.slug(), {
        name: this.name().trim(),
        text: this.text().trim(),
        website: this.honeypot(),
      });
      // Append locally rather than refetching: the list is CDN-cached.
      if (comment) this.comments.update((comments) => [...comments, comment]);
      this.text.set("");
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}
