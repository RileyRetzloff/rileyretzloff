import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ClerkService } from "ngx-clerk";
import { RecipesService, type Me } from "./recipes.service";

@Component({
  selector: "app-recipe-edit",
  imports: [FormsModule, RouterLink],
  templateUrl: "./recipe-edit.html",
})
export class RecipeEdit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(RecipesService);
  private readonly clerk = inject(ClerkService);

  /** null in "new" mode; the slug in "edit" mode. */
  protected readonly editingSlug = signal<string | null>(null);
  protected readonly me = signal<Me | null>(null);
  protected readonly loadFailed = signal(false);

  protected readonly title = signal("");
  protected readonly author = signal("");
  protected readonly body = signal("");
  protected readonly saving = signal(false);
  protected readonly error = signal("");

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get("slug");
    this.editingSlug.set(slug);

    try {
      this.me.set(await this.service.me());
    } catch {
      this.me.set({ signedIn: false, contributor: false, userId: null });
    }
    if (!this.me()?.contributor) return;

    if (slug) {
      try {
        const recipe = await this.service.get(slug);
        this.title.set(recipe.title);
        this.body.set(recipe.body);
      } catch {
        this.loadFailed.set(true);
      }
    } else {
      const user = this.clerk.user();
      this.author.set(
        user?.fullName || user?.firstName || user?.username || "",
      );
    }
  }

  protected async onSave(): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set("");
    try {
      const slug = this.editingSlug();
      if (slug) {
        await this.service.update(slug, {
          title: this.title(),
          body: this.body(),
        });
        await this.router.navigate(["/recipes", slug]);
      } else {
        const newSlug = await this.service.create({
          title: this.title(),
          body: this.body(),
          author: this.author(),
        });
        await this.router.navigate(["/recipes", newSlug]);
      }
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : "something went wrong",
      );
    } finally {
      this.saving.set(false);
    }
  }

  protected async onDelete(): Promise<void> {
    const slug = this.editingSlug();
    if (!slug || this.saving()) return;
    if (!confirm(`delete "${this.title()}" for real?`)) return;
    this.saving.set(true);
    this.error.set("");
    try {
      await this.service.remove(slug);
      await this.router.navigate(["/recipes"]);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : "something went wrong",
      );
    } finally {
      this.saving.set(false);
    }
  }
}
