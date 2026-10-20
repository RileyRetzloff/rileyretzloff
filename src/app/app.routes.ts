import { type Routes } from "@angular/router";
import { About } from "./about/about";
import { Home } from "./home/home";
import { BlogList } from "./blog/blog-list/blog-list";
import { BlogPost } from "./blog/blog-post/blog-post";
import { Feedback } from "./feedback/feedback";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "about", component: About },
  { path: "blog", component: BlogList },
  { path: "blog/:slug", component: BlogPost },
  { path: "feedback", component: Feedback },
  { path: "**", redirectTo: "" },
];
