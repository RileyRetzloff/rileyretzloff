import { Component } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { POSTS } from "../posts.generated";

@Component({
  selector: "app-blog-list",
  imports: [RouterLink, DatePipe],
  templateUrl: "./blog-list.html",
})
export class BlogList {
  protected readonly posts = POSTS;
}
