import { Injectable, inject } from "@angular/core";
import { ClerkService } from "ngx-clerk";

export interface RecipeSummary {
  slug: string;
  title: string;
  author: string;
  created: string;
  updated: string;
}

export interface Recipe extends RecipeSummary {
  body: string;
}

export interface RecipeComment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export interface Me {
  signedIn: boolean;
  contributor: boolean;
  userId: string | null;
}

export class ApiError extends Error {
  status?: number;
  userId?: string;
}

/** Talks to the /api/recipes functions (GitHub-backed, Clerk-authed). */
@Injectable({ providedIn: "root" })
export class RecipesService {
  private readonly clerk = inject(ClerkService);

  private async request(
    path: string,
    options: { method?: string; body?: unknown; auth?: boolean } = {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (options.auth) {
      const token = await this.clerk.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(path, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new ApiError(data.error || `request failed (${res.status})`);
      err.status = res.status;
      err.userId = data.userId;
      throw err;
    }
    return data;
  }

  async list(): Promise<RecipeSummary[]> {
    return (await this.request("/api/recipes")).recipes;
  }

  async get(slug: string): Promise<Recipe> {
    return (await this.request(`/api/recipes/${slug}`)).recipe;
  }

  async create(input: {
    title: string;
    body: string;
    author: string;
  }): Promise<string> {
    return (
      await this.request("/api/recipes", {
        method: "POST",
        body: input,
        auth: true,
      })
    ).slug;
  }

  async update(
    slug: string,
    input: { title: string; body: string },
  ): Promise<void> {
    await this.request(`/api/recipes/${slug}`, {
      method: "PUT",
      body: input,
      auth: true,
    });
  }

  async remove(slug: string): Promise<void> {
    await this.request(`/api/recipes/${slug}`, {
      method: "DELETE",
      auth: true,
    });
  }

  async comments(slug: string): Promise<RecipeComment[]> {
    return (await this.request(`/api/recipes/${slug}/comments`)).comments;
  }

  async addComment(
    slug: string,
    input: { name: string; text: string; website: string },
  ): Promise<void> {
    await this.request(`/api/recipes/${slug}/comments`, {
      method: "POST",
      body: input,
    });
  }

  async me(): Promise<Me> {
    const data = await this.request("/api/me", { auth: true });
    return {
      signedIn: !!data.signedIn,
      contributor: !!data.contributor,
      userId: data.userId ?? null,
    };
  }
}
