import { Component, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { RouterLink } from "@angular/router";
import { Session } from "../auth/session";
import { type RecipeSummary } from "./recipes";

@Component({
  selector: "app-recipe-list",
  imports: [RouterLink, DatePipe],
  templateUrl: "./recipe-list.html",
})
export class RecipeList {
  protected readonly recipes = httpResource<RecipeSummary[]>(() => "/api/recipes");
  protected readonly contributor = inject(Session).contributor;
}
