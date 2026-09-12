# Git

- Write conventional commit messages.

## Development

Use Bun for dependencies and scripts, with tooling versions managed by mise.

Linting and formatting use Oxfmt and type-aware Oxlint, following `~/sidequest`. Run `bun run format` and `bun run lint` to check, or their `:fix` variants to apply fixes. Do not add Prettier or ESLint. Keep `.astro` template formatting consistent manually; Oxfmt does not support these files.

After changes, run `bun run format`, `bun run lint`, `bun run check`, and `bun run build`.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Writing

- Links to my products should use `ProductLink` and links to other blog posts should use `ArticleLink`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
