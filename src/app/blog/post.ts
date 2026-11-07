/** A blog post, generated from posts/*.md by scripts/build-posts.mjs. */
export interface Post {
  slug: string;
  title: string;
  date: string;
  /** Rendered from Riley's own markdown, so it's trusted (not sanitized). */
  html: string;
}
