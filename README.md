# jamiedavenport.me

Jamie Davenport’s personal site. Built with Astro and Tailwind CSS, managed with Bun, and deployed to Cloudflare Workers as static assets.

## Setup

Install [mise](https://mise.jdx.dev/getting-started.html), then run:

```sh
mise trust
mise install
bun install --frozen-lockfile
bun run dev
```

`mise.toml` pins Bun and Node.js. Bun manages dependencies and scripts; Node.js runs the Astro and Wrangler CLIs. Activate mise in your shell, or prefix commands with `mise exec --`.

The development server runs at `http://localhost:4321`.

## Commands

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `bun run dev`          | Start the Astro development server              |
| `bun run check`        | Check Astro and TypeScript files                |
| `bun run format`       | Check formatting                                |
| `bun run format:fix`   | Fix formatting                                  |
| `bun run lint`         | Run type-aware linting                          |
| `bun run lint:fix`     | Apply lint fixes                                |
| `bun run build`        | Build the static site into `dist/`              |
| `bun run preview`      | Preview the production build locally            |
| `bun run deploy:check` | Check, build, and dry-run Cloudflare deployment |
| `bun run deploy`       | Check, build, and deploy to Cloudflare Workers  |

Linting and formatting use Oxfmt and type-aware Oxlint, with conventions adapted from Sidequest.

Oxfmt does not currently format `.astro` templates. Keep their formatting consistent manually; `bun run check` validates Astro templates and their TypeScript. Oxlint covers JavaScript and TypeScript, including supported script blocks in framework files. See [Oxfmt language support](https://oxc.rs/docs/guide/usage/formatter/language-support.html).

## Deployment

Authenticate with Cloudflare once, then deploy:

```sh
bunx wrangler login
bun run deploy
```

For noninteractive deployment, set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the deployment environment. Keep credentials out of Git.

`wrangler.jsonc` deploys `dist/` to the Worker named `jamiedavenport-me`, including a custom 404 page. The site is entirely static, so it does not need an Astro server adapter. See [Cloudflare’s Astro guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/).

`wrangler.jsonc` configures `jamiedavenport.me` and `www.jamiedavenport.me` as custom domains. Running `bun run deploy` attaches both domains to the Worker; the `jamiedavenport.me` zone must be active in the Cloudflare account used for deployment. Cloudflare manages their DNS records and certificates. See [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

The `site` setting in `astro.config.mjs` and canonical links use `https://jamiedavenport.me` as the preferred URL. Both hostnames serve the site; `www` does not redirect.

## Editing

- `src/pages/index.astro`: homepage
- `src/pages/404.astro`: missing-page response
- `src/layouts/Layout.astro`: shared document and metadata
- `src/styles/global.css`: Tailwind entry point
- `public/`: assets copied directly into the build

## Writing articles

Group each post and its assets in a folder inside `src/content/blog/`:

```text
src/content/blog/
  my-article/
    index.mdx
    diagram.svg
    screenshot.png
```

`my-article/index.mdx` becomes `/blog/my-article/`. Use lowercase, hyphenated
folder names and keep them stable after publishing. Flat files such as
`my-article.mdx` also work; use one form per article, since both resolve to the
same URL. Jamie is always the author.

```yaml
---
title: "My article"
description: "A concise description for the article header, search engines, and link previews."
publishedAt: 2026-09-08
updatedAt: 2026-09-10 # Optional; cannot precede publishedAt.
draft: true
---
```

Start with `example-article/index.mdx`, which demonstrates prose, code, images, and
tables. Drafts appear in the local development list with a draft label and
`noindex`. They have no page, home-page link, or sitemap entry in production.
Remove `draft: true` (or set it to `false`) to publish on the next build and
deployment. Dates describe publication; future dates do not schedule publishing.

Run `bun run dev -- --background` to preview posts. Use `bun run astro dev status`,
`bun run astro dev logs`, and `bun run astro dev stop` to manage the background
server. The example is available locally at `/blog/example-article/`.

The page supplies the article's `h1`; start body sections with `##`. Fenced code
blocks accept language names such as `ts`, `bash`, `json`, and `diff` and use
Shiki's GitHub Light theme. Tables scroll horizontally on narrow screens.

Keep screenshots alongside `index.mdx` in the article's folder.
Import them into MDX and use the shared component for sizing and optional captions:

```mdx
import Screenshot from "@/components/Screenshot.astro";
import screenshot from "@/content/blog/my-article/screenshot.png";

<Screenshot
  src={screenshot}
  alt="Describe the relevant detail visible in the screenshot."
  caption="An optional caption."
/>
```

MDX supports other Astro component imports without a client framework. Use `@/`
for imports from `src/` throughout the project; this alias is configured in
`tsconfig.json` and also works in MDX and stylesheets. Images should have meaningful
alt text; screenshot dimensions are inferred from the imported file.

The home page automatically lists published titles and dates, newest first.
Article metadata, canonical URLs, and `BlogPosting` structured data are generated
from the collection. The official `@astrojs/sitemap` integration generates
`/sitemap-index.xml` and `/sitemap-0.xml` from built pages; drafts and error pages
are excluded. Publication and update dates are included in each article's
metadata. Article social images are intentionally deferred.

Article formatting uses `@tailwindcss/typography` with a few site-specific
overrides in `src/styles/prose.css`. Body typography matches the home page:
16px on mobile and 14px from the `sm` breakpoint, with the same line spacing.
The author portrait links home, and a return link remains below the article.
Before publishing, run:

```sh
bun run format
bun run lint
bun run check
bun run build
```

Navigation uses Astro's `ClientRouter` and native view transitions with a fade
fallback. The portrait morphs when visible, and motion is disabled when the
reader requests reduced motion. OpenPanel tracks completed Astro navigations.
