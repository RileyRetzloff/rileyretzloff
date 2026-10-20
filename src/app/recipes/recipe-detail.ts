import { Component, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs";
import { marked } from "marked";
import { RecipesService, type Recipe } from "./recipes.service";
import { RecipeComments } from "./recipe-comments";

@Component({
  selector: "app-recipe-detail",
  imports: [RouterLink, DatePipe, RecipeComments],
  templateUrl: "./recipe-detail.html",
})
export class RecipeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RecipesService);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get("slug"))),
  );

  protected readonly recipe = signal<Recipe | null>(null);
  protected readonly notFound = signal(false);
  protected readonly contributor = signal(false);

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (slug) void this.load(slug);
    });
    void this.checkContributor();
  }

  private async checkContributor(): Promise<void> {
    try {
      this.contributor.set((await this.service.me()).contributor);
    } catch {
      // Signed-out visitors just don't see the edit link.
    }
  }

  private async load(slug: string): Promise<void> {
    try {
      this.recipe.set(await this.service.get(slug));
    } catch {
      this.notFound.set(true);
    }
  }

  /** Markdown → HTML. Angular sanitizes [innerHTML] — no bypass here. */
  protected html(recipe: Recipe): string {
    const out = marked.parse(recipe.body);
    return typeof out === "string" ? out : "";
  }
}
