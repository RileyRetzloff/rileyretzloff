import { type Routes } from "@angular/router";
import { canActivateClerk, catchAllRoute } from "ngx-clerk";
import { About } from "./about/about";
import { Home } from "./home/home";
import { BlogList } from "./blog/blog-list/blog-list";
import { BlogPost } from "./blog/blog-post/blog-post";
import { Feedback } from "./feedback/feedback";
import { SignInPage } from "./auth/sign-in-page";
import { SignUpPage } from "./auth/sign-up-page";
import { RecipeList } from "./recipes/recipe-list";
import { RecipeDetail } from "./recipes/recipe-detail";
import { RecipeEdit } from "./recipes/recipe-edit";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "about", component: About },
  { path: "blog", component: BlogList },
  { path: "blog/:slug", component: BlogPost },
  { path: "feedback", component: Feedback },
  { path: "recipes", component: RecipeList },
  { path: "recipes/new", component: RecipeEdit, canActivate: [canActivateClerk] },
  { path: "recipes/:slug", component: RecipeDetail },
  { path: "recipes/:slug/edit", component: RecipeEdit, canActivate: [canActivateClerk] },
  // Clerk's multi-step flows live under these (/sign-in/factor-one, ...).
  { matcher: catchAllRoute("sign-in"), component: SignInPage },
  { matcher: catchAllRoute("sign-up"), component: SignUpPage },
  { path: "**", redirectTo: "" },
];
