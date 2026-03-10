# Cloudea Blog

A modern blog and documentation platform inspired by Docusaurus. Built with Next.js 16, Tailwind CSS v4, and shadcn/ui.

> **[Русская версия (README.ru.md)](./README.ru.md)**

## Features

- **Blog** — MDX and Markdown posts with syntax highlighting (Shiki), tags, yearly archive, reading time
- **Nested folders** — posts in `content/blog/2025/my-post/index.mdx` with co-located assets
- **Drafts** — `draft: true` in frontmatter hides posts from all listings and feeds
- **Documentation** — multi-level structure with sidebar, subcategories, TOC, breadcrumbs, and last modified date
- **Custom pages** — MDX pages from `content/pages/` (About, Projects, etc.)
- **Configuration** — single `cloudea.config.ts` file, Docusaurus-style
- **Dark theme** — light/dark/system via next-themes with customizable color scheme
- **i18n** — multilingual posts (`slug.en.mdx` alongside `slug.mdx`)
- **Search** — global search with Ctrl+K across blog and docs
- **Comments** — Giscus (GitHub Discussions) or Supabase
- **Auth** — GitHub OAuth via Supabase (login button hidden when provider is not Supabase)
- **SEO** — auto meta tags, sitemap.xml, robots.txt, JSON-LD, OG images
- **Feeds** — RSS, Atom, JSON Feed
- **Analytics** — Google Analytics (gtag) and Yandex Metrika via config
- **Geo-blocking** — restrict posts by country via frontmatter, or hide sections with `<GeoHide>` component
- **Share buttons** — Twitter/X, Telegram, copy link
- **Related posts** — tag-based recommendations at the bottom of articles
- **Copy button** — one-click code block copying
- **Error boundaries** — per-section error handling (blog, docs)
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Loading skeletons** — animated placeholders during navigation
- **Custom CSS/JS** — attach custom styles and scripts via config
- **Semantic Release** — automatic versioning and CHANGELOG

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, RSC, Turbopack |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) | UI components |
| [Supabase](https://supabase.com) | Auth, comments |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | MDX/Markdown rendering |
| [Shiki](https://shiki.style) | Syntax highlighting |
| [Giscus](https://giscus.app) | GitHub Discussions comments |
| [semantic-release](https://semantic-release.gitbook.io) | Automated releases |

## Quick Start

```bash
git clone https://github.com/BazZziliuS/cloudea-blog.git
cd cloudea-blog
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

All settings live in `cloudea.config.ts`:

```ts
const config: CloudeaConfig = {
  title: "My Blog",
  url: "https://example.com",
  homepage: "landing",     // "landing" | "blog" | "docs" | "about"
  customCss: ["styles/custom.css"],
  // customScripts: [{ src: "scripts/analytics.js" }],

  analytics: {
    yandexMetrika: "101940986",   // Yandex Metrika
    // gtag: "G-XXXXXXXXXX",      // Google Analytics
  },

  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en"],
  },

  comments: {
    provider: "giscus",    // "giscus" | "supabase" | "none"
    giscus: { repo: "...", repoId: "...", category: "...", categoryId: "...", mapping: "pathname" },
  },
};
```

## Theming

Override CSS variables in `styles/custom.css`:

```css
:root {
  --primary: oklch(0.55 0.13 230);           /* cyan */
  --primary-foreground: oklch(1 0 0);
}

.dark {
  --background: oklch(0.07 0.025 265);       /* deep navy */
  --primary: oklch(0.65 0.14 230);           /* lighter cyan */
}
```

Custom CSS is inlined via `<style>` in `<head>`, ensuring it overrides the base theme.

## Project Structure

```
cloudea.config.ts                  # Platform configuration
styles/
  custom.css                       # Custom theme (CSS variables)
content/
  blog/                            # Blog posts (.mdx or .md)
    2026/hello-world.mdx           # File-style post
    2026/hello-world.en.mdx        # Post translation
    2025/05-17-n8n/                # Directory-style post
      index.mdx                    # Post content
      screenshot.png               # Co-located assets
  docs/                            # Documentation
    getting-started/
      index.mdx                    # Category index page
      introduction.mdx
      installation.mdx
    bots/
      index.mdx                    # Category index
      orders/                      # Subcategory
        index.mdx                  # Subcategory index
        project-a.mdx
      personal/
        index.mdx
        project-b.mdx
  pages/                           # Custom pages
    about.mdx                      # → /about
src/
  app/                             # Next.js App Router
    layout.tsx                     # Root layout
    error.tsx                      # Error boundary
    not-found.tsx                  # Custom 404
    blog/[...slug]/page.tsx        # Blog post page
    docs/[...slug]/page.tsx        # Documentation page
  components/                      # React components
  lib/                             # Utilities (content, config, i18n)
```

## Adding Content

### Blog Post

```mdx
---
title: "Post Title"
description: "Short description"
date: "2026-03-07"
tags: ["tag1", "tag2"]
draft: false
---

Post content...
```

Both `.mdx` (with JSX components) and `.md` (plain Markdown) formats are supported.

### Multilingual Posts

- `hello-world.mdx` — default language
- `hello-world.en.mdx` — English version

For directory-style posts: `index.mdx` + `index.en.mdx`.

### Geo-blocking

```yaml
geo_block:
  countries: ["RU", "DE"]
  message: "This content is not available in your region."
```

### Documentation

```mdx
---
title: "Page Title"
description: "Description"
order: 1
---
```

Category is determined by the folder name. An `index.mdx` inside a folder creates a category index page. Nested folders create subcategories with collapsible sections in the sidebar.

### Section Geo-blocking

Use `<GeoHide>` in MDX to hide specific sections by country:

```mdx
<GeoHide countries={["RU"]}>

## VPN Tools

Content hidden for users in Russia...

</GeoHide>
```

Blocked content is shown with a blur overlay and a message.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Linting |
| `npm run release` | Run semantic-release |

## License

MIT
