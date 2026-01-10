# Paper Fold Package Designer

A web-based tool for designing paper folding patterns with interactive 3D visualization. Create boxes, pyramids, envelopes, and more — then export to SVG for cutting or STL for 3D printing.

**Live Demo**: https://chaeguevara.github.io/paperFoldPackage/

## Features

- **3D Visualization** - Interactive Three.js preview with orbit controls
- **Multiple Shapes** - Box, Pyramid, Cylinder, Hexagonal Prism, Envelope
- **Customizable Dimensions** - Adjust width, height, depth, and thickness
- **SVG Export** - Vector patterns with fold lines for cutting machines
- **STL Export** - 3D printable models (coming soon)
- **SEO Optimized** - Meta tags, structured data, sitemap for discoverability

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Three.js + React Three Fiber | 3D rendering |
| Vite | Build tool & dev server |
| GitHub Pages | Static hosting |

## How React Deploys to GitHub Pages

GitHub Pages only serves **static files** (HTML, CSS, JS). Here's how it works:

```
┌─────────────────┐     npm run build     ┌─────────────────┐
│  React Source   │ ──────────────────►   │  Static Files   │
│  (src/*.tsx)    │      (Vite)           │  (dist/)        │
└─────────────────┘                       └────────┬────────┘
                                                   │
                                          npm run deploy
                                            (gh-pages)
                                                   │
                                                   ▼
                                    ┌─────────────────────────┐
                                    │  gh-pages branch        │
                                    │  (GitHub Pages serves   │
                                    │   this as a website)    │
                                    └─────────────────────────┘
```

1. **Build**: Vite compiles React/TypeScript into plain HTML, CSS, and JavaScript
2. **Deploy**: The `gh-pages` package pushes the `dist/` folder to the `gh-pages` branch
3. **Serve**: GitHub Pages hosts the static files from that branch

### Key Configuration

**vite.config.ts** - Sets the base path for GitHub Pages:
```typescript
export default defineConfig({
  base: '/paperFoldPackage/',  // Must match repo name
  // ...
});
```

**public/404.html** - Handles SPA routing (GitHub Pages doesn't support client-side routing natively):
```html
<script>
  sessionStorage.redirect = location.href;
</script>
<meta http-equiv="refresh" content="0;URL='/'">
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/chaeguevara/paperFoldPackage.git
cd paperFoldPackage

# Install dependencies
npm install
```

### Development

```bash
# Start dev server (hot reload)
npm run dev

# Open http://localhost:5173/paperFoldPackage/
```

### Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deploy to GitHub Pages

**First time setup:**

1. Go to your GitHub repo → Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select `gh-pages` branch (will be created on first deploy)

**Deploy:**

```bash
npm run deploy
```

This runs `vite build` then pushes `dist/` to the `gh-pages` branch.

## Project Structure

```
paperFoldPackage/
├── public/
│   ├── 404.html          # SPA routing fix for GitHub Pages
│   ├── robots.txt        # SEO
│   └── sitemap.xml       # SEO
├── src/
│   ├── core/             # Three.js scene & geometry
│   ├── export/           # SVG/STL export modules
│   ├── pages/            # Route components
│   ├── seo/              # Meta tags, structured data
│   ├── ui/               # UI components
│   └── App.tsx           # Main app with routing
├── .claude/skills/       # AI assistant skills (optional)
├── index.html            # Entry point
├── vite.config.ts        # Vite configuration
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and deploy to GitHub Pages |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Customization

### Change Repository Name

If you fork this repo with a different name, update:

1. `vite.config.ts` → `base: '/your-repo-name/'`
2. `public/404.html` → redirect URL
3. `src/App.tsx` → `<BrowserRouter basename="/your-repo-name">`
4. `public/sitemap.xml` → URLs
5. `public/robots.txt` → sitemap URL

### Add Your Own Shapes

Edit `src/core/Scene.tsx` to add new geometry types in the `FoldMesh` component.

## License

MIT

## Acknowledgments

- [Three.js](https://threejs.org/) - 3D library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - React renderer for Three.js
- [Vite](https://vitejs.dev/) - Build tool
- [gh-pages](https://github.com/tschaub/gh-pages) - GitHub Pages deployment
