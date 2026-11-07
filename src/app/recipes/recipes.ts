import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Reads go through httpResource in the components; writes go through here.
// API: api/recipes.js, api/recipes/[slug].js, api/recipes/[slug]/comments.js

export interface RecipeSummary {
  slug: string;
  title: string;
  author: string;
  created: string;
  updated: string;
}

export interface Recipe extends RecipeSummary {
  /** Markdown. */
  body: string;
}

export interface RecipeComment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class RecipesApi {
  private readonly http = inject(HttpClient);

  async create(recipe: { title: string; author: string; body: string }): Promise<string> {
    return (await firstValueFrom(this.http.post<{ slug: string }>("/api/recipes", recipe))).slug;
  }

  async update(slug: string, recipe: { title: string; body: string }): Promise<string> {
    return (await firstValueFrom(this.http.put<{ slug: string }>(`/api/recipes/${slug}`, recipe)))
      .slug;
  }

  remove(slug: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(`/api/recipes/${slug}`));
  }

  /** Null when the server quietly dropped it (spam honeypot). */
  addComment(
    slug: string,
    comment: { name: string; text: string; website: string },
  ): Promise<RecipeComment | null> {
    return firstValueFrom(
      this.http.post<RecipeComment | null>(`/api/recipes/${slug}/comments`, comment),
    );
  }
}

/** The API's `{ error }` message, if there is one. */
export function errorMessage(err: unknown): string {
  return (err instanceof HttpErrorResponse && err.error?.error) || "something went wrong";
}
