# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**paperFoldPackage** - GitHub Pages hosted web app for configuring paper folding packages with 3D visualization. Users configure geometric patterns and export to SVG, DWF, or STL for cutting/3D printing.

| Aspect | Choice |
|--------|--------|
| Hosting | GitHub Pages (static) |
| 3D Engine | Three.js |
| Monetization | Google AdSense |
| SEO | Pre-rendering + meta tags |

## Commands

```bash
# Development
npm run dev          # Local dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build

# Deployment
npm run deploy       # Build + deploy to gh-pages branch

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
```

## Architecture

### Core Pipeline
```
User Config → Three.js Scene → Export Pipeline → SVG/DWF/STL
```

### Key Modules

| Module | Responsibility |
|--------|---------------|
| `src/core/scene.ts` | Three.js scene setup, camera, renderer |
| `src/core/geometry.ts` | Parametric fold pattern generation |
| `src/export/` | Format exporters (svg, dwf, stl) |
| `src/ui/` | Configuration panels, controls |
| `src/seo/` | Meta tags, structured data, sitemap |

### Three.js Export Strategy

- **SVG**: Project 3D → 2D using `SVGRenderer` or custom projection
- **STL**: Use `STLExporter` from three/examples/jsm/exporters
- **DWF**: Convert via intermediate format (SVG → DWF) or custom serializer

### GitHub Pages Constraints

- Static files only (no server-side rendering)
- SPA routing requires 404.html redirect hack
- Base path: `/<repo-name>/` in production

## SEO for JavaScript SPA

Since GitHub Pages serves static files:

1. **Pre-rendering**: Generate static HTML snapshots for crawlers
2. **Meta tags**: Dynamic injection via `document.head` on route change
3. **Structured data**: JSON-LD for rich snippets (Product, HowTo schemas)
4. **Sitemap**: Static `sitemap.xml` in public folder
5. **robots.txt**: Allow all, point to sitemap

## AdSense Integration

```
┌─────────────────────────────────────┐
│  Header Ad (728x90 leaderboard)     │
├─────────────┬───────────────────────┤
│             │                       │
│  Sidebar    │   Three.js Canvas     │
│  Ad Unit    │   (main content)      │
│  (300x250)  │                       │
│             │                       │
├─────────────┴───────────────────────┤
│  Footer Ad (responsive)             │
└─────────────────────────────────────┘
```

- Load AdSense script async to not block rendering
- Use `Intersection Observer` for lazy-loading ad units
- Responsive ad units for mobile

## File Conventions

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`
- CSS Modules: `ComponentName.module.css`

## Build Output

Production build outputs to `dist/`, deployed to `gh-pages` branch.
