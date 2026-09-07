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
