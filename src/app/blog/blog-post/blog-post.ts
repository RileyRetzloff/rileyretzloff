import { Component, computed, inject, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { POSTS } from "../posts.generated";

@Component({
  selector: "app-blog-post",
  imports: [RouterLink, DatePipe],
  templateUrl: "./blog-post.html",
})
export class BlogPost {
  private readonly sanitizer = inject(DomSanitizer);

  /** Route param. */
  readonly slug = input.required<string>();

  protected readonly post = computed(() => POSTS.find((post) => post.slug === this.slug()));
  protected readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.post()?.html ?? ""),
  );
}
