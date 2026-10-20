import { Component, inject, input, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { RecipesService, type RecipeComment } from "./recipes.service";

/** Conversation section under a recipe. Anyone can post — no account. */
@Component({
  selector: "app-recipe-comments",
  imports: [DatePipe, FormsModule],
  templateUrl: "./recipe-comments.html",
})
export class RecipeComments {
  private readonly service = inject(RecipesService);

  readonly slug = input.required<string>();

  protected readonly comments = signal<RecipeComment[] | null>(null);
  protected readonly name = signal("");
  protected readonly text = signal("");
  protected readonly honeypot = signal("");
  protected readonly sending = signal(false);
  protected readonly failed = signal(false);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    try {
      this.comments.set(await this.service.comments(this.slug()));
    } catch {
      this.comments.set([]);
    }
  }

  protected async onSubmit(): Promise<void> {
    const value = this.text().trim();
    if (!value || this.sending()) return;
    this.sending.set(true);
    this.failed.set(false);
    try {
      await this.service.addComment(this.slug(), {
        name: this.name().trim(),
        text: value,
        website: this.honeypot(),
      });
      this.text.set("");
      await this.load();
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}
