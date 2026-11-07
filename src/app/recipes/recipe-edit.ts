import { Component, inject, input, linkedSignal, signal } from "@angular/core";
import { httpResource } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ClerkService } from "ngx-clerk";
import { Session } from "../auth/session";
import { errorMessage, RecipesApi, type Recipe } from "./recipes";

/** /recipes/new and /recipes/:slug/edit. */
@Component({
  selector: "app-recipe-edit",
  imports: [FormsModule, RouterLink],
  templateUrl: "./recipe-edit.html",
})
export class RecipeEdit {
  private readonly api = inject(RecipesApi);
  private readonly router = inject(Router);
  private readonly clerk = inject(ClerkService);
  protected readonly session = inject(Session);

  /** Route param; undefined when creating a new recipe. */
  readonly slug = input<string>();

  protected readonly existing = httpResource<Recipe>(() =>
    this.slug() ? `/api/recipes/${this.slug()}` : undefined,
  );

  protected readonly title = linkedSignal(() =>
    this.existing.hasValue() ? this.existing.value().title : "",
  );
  protected readonly body = linkedSignal(() =>
    this.existing.hasValue() ? this.existing.value().body : "",
  );
  protected readonly author = linkedSignal(() => {
    const user = this.clerk.user();
    return user?.fullName || user?.firstName || user?.username || "";
  });

  protected readonly saving = signal(false);
  protected readonly error = signal("");

  protected async save(): Promise<void> {
    const slug = this.slug();
    const recipe = { title: this.title(), body: this.body() };
    await this.attempt(async () => {
      const saved = slug
        ? await this.api.update(slug, recipe)
        : await this.api.create({ ...recipe, author: this.author() });
      await this.router.navigate(["/recipes", saved]);
    });
  }

  protected async remove(slug: string): Promise<void> {
    if (!confirm(`delete "${this.title()}" for real?`)) return;
    await this.attempt(async () => {
      await this.api.remove(slug);
      await this.router.navigate(["/recipes"]);
    });
  }

  private async attempt(action: () => Promise<void>): Promise<void> {
    this.saving.set(true);
    this.error.set("");
    try {
      await action();
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
