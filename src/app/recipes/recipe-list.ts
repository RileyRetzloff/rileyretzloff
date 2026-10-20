import { Component, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { RecipesService, type RecipeSummary } from "./recipes.service";

@Component({
  selector: "app-recipe-list",
  imports: [RouterLink, DatePipe],
  templateUrl: "./recipe-list.html",
})
export class RecipeList {
  private readonly service = inject(RecipesService);

  protected readonly recipes = signal<RecipeSummary[] | null>(null);
  protected readonly contributor = signal(false);
  protected readonly failed = signal(false);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.recipes.set(await this.service.list());
    } catch {
      this.failed.set(true);
    }
    try {
      this.contributor.set((await this.service.me()).contributor);
    } catch {
      // Signed-out visitors just don't see contributor controls.
    }
  }
}
