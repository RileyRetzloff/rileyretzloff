import { type Routes } from "@angular/router";
import { catchAllRoute } from "ngx-clerk";
import { About } from "./about/about";
import { Home } from "./home/home";
import { BlogList } from "./blog/blog-list/blog-list";
import { BlogPost } from "./blog/blog-post/blog-post";
import { Feedback } from "./feedback/feedback";
import { SignInPage } from "./auth/sign-in-page";
import { SignUpPage } from "./auth/sign-up-page";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "about", component: About },
  { path: "blog", component: BlogList },
  { path: "blog/:slug", component: BlogPost },
  { path: "feedback", component: Feedback },
  // Clerk's components drive multi-step flows under these paths
  // (/sign-in/factor-one, /sign-up/verify-email-address, ...), so they
  // need catch-all matchers rather than plain paths.
  { matcher: catchAllRoute("sign-in"), component: SignInPage },
  { matcher: catchAllRoute("sign-up"), component: SignUpPage },
  { path: "**", redirectTo: "" },
];
