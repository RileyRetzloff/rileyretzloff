import { Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DomSanitizer, type SafeHtml } from "@angular/platform-browser";
import { map } from "rxjs";
import { POSTS } from "../posts.generated";

@Component({
  selector: "app-blog-post",
  imports: [RouterLink, DatePipe],
  templateUrl: "./blog-post.html",
})
export class BlogPost {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get("slug"))),
  );

  protected readonly post = () => POSTS.find((p) => p.slug === this.slug());

  /** The HTML comes from the author's own markdown files in posts/ — trusted. */
  protected trustedHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
