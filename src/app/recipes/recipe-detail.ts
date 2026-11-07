import { Component, computed, inject, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { RouterLink } from "@angular/router";
import { marked } from "marked";
import { Session } from "../auth/session";
import { RecipeComments } from "./recipe-comments";
import { type Recipe } from "./recipes";

@Component({
  selector: "app-recipe-detail",
  imports: [RouterLink, DatePipe, RecipeComments],
  templateUrl: "./recipe-detail.html",
})
export class RecipeDetail {
  /** Route param. */
  readonly slug = input.required<string>();

  protected readonly recipe = httpResource<Recipe>(() => `/api/recipes/${this.slug()}`);
  protected readonly contributor = inject(Session).contributor;

  /** Recipes are user-written, so unlike blog posts this HTML stays sanitized. */
  protected readonly html = computed(() =>
    this.recipe.hasValue() ? marked.parse(this.recipe.value().body, { async: false }) : "",
  );
}
