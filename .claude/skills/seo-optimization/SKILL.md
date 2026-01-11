---
name: seo-optimization
description: SEO optimization for JavaScript SPAs on GitHub Pages. Use when implementing meta tags, structured data, sitemap, or when user mentions SEO, search ranking, Google indexing, or discoverability.
---

# SEO for GitHub Pages SPA

## Challenge

GitHub Pages = static hosting. SPAs render client-side. Crawlers may not execute JS.

## Solution Overview

| Strategy | Effort | Impact |
|----------|--------|--------|
| Pre-rendering | Medium | High |
| Dynamic meta tags | Low | Medium |
| Structured data (JSON-LD) | Low | High |
| Sitemap + robots.txt | Low | Medium |
| 404.html SPA routing | Low | Required |

## Target Keywords (Paper Folding)

- "paper folding template generator"
- "origami pattern maker online"
- "SVG fold pattern creator"
- "printable paper craft templates"

## Files in This Skill

- **[reference.md](./reference.md)** - Meta tag specs, schema.org types, crawler behavior
- **[examples.md](./examples.md)** - Complete implementations
- **[scripts/generate-sitemap.ts](./scripts/generate-sitemap.ts)** - Sitemap generator

## Quick Start

1. Add meta tags component
2. Create `public/sitemap.xml`
3. Create `public/robots.txt`
4. Add `public/404.html` for SPA routing
5. Consider pre-rendering for key pages
