# SEO Implementation Examples

## Dynamic Meta Tags Component (React)

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  type?: string;
}

const pageMeta: Record<string, PageMeta> = {
  '/': {
    title: 'Paper Fold Package Designer - Create Patterns Online',
    description: 'Design paper folding patterns with our free online tool. Export to SVG for cutting or STL for 3D printing.',
    image: '/og-home.jpg',
  },
  '/templates': {
    title: 'Paper Fold Templates - Boxes, Envelopes, Origami',
    description: 'Browse our collection of paper folding templates. Customize and download instantly.',
    image: '/og-templates.jpg',
  },
  '/editor': {
    title: 'Pattern Editor - Paper Fold Package Designer',
    description: 'Create custom paper folding patterns with our interactive 3D editor.',
    image: '/og-editor.jpg',
  },
};

export function MetaTags() {
  const location = useLocation();

  useEffect(() => {
    const meta = pageMeta[location.pathname] || pageMeta['/'];
    const baseUrl = 'https://username.github.io/paperFoldPackage';

    // Title
    document.title = meta.title;

    // Standard meta
    updateMeta('description', meta.description);

    // Open Graph
    updateMeta('og:title', meta.title, 'property');
    updateMeta('og:description', meta.description, 'property');
    updateMeta('og:url', `${baseUrl}${location.pathname}`, 'property');
    updateMeta('og:type', meta.type || 'website', 'property');
    if (meta.image) {
      updateMeta('og:image', `${baseUrl}${meta.image}`, 'property');
    }

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', meta.title);
    updateMeta('twitter:description', meta.description);
    if (meta.image) {
      updateMeta('twitter:image', `${baseUrl}${meta.image}`);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${baseUrl}${location.pathname}`);

  }, [location.pathname]);

  return null;
}

function updateMeta(name: string, content: string, attr = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
```

## Structured Data Component

```tsx
import { useEffect } from 'react';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// Usage
const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Paper Fold Package Designer",
  "description": "Design paper folding patterns and export to SVG or STL",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
};

function App() {
  return (
    <>
      <StructuredData data={appSchema} />
      <MetaTags />
      {/* ... */}
    </>
  );
}
```

## public/404.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Store the current path
    sessionStorage.redirect = location.href;
  </script>
  <!-- Redirect to root after storing path -->
  <meta http-equiv="refresh" content="0;URL='/paperFoldPackage/'">
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
```

## index.html SPA Redirect Handler

Add before closing `</body>`:

```html
<script>
  // Handle SPA routing on GitHub Pages
  (function(){
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null,
        redirect.replace(location.origin, '')
      );
    }
  })();
</script>
```

## public/robots.txt

```
User-agent: *
Allow: /

Sitemap: https://username.github.io/paperFoldPackage/sitemap.xml
```

## public/sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://username.github.io/paperFoldPackage/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://username.github.io/paperFoldPackage/templates</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://username.github.io/paperFoldPackage/editor</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://username.github.io/paperFoldPackage/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

## Vite Pre-rendering Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/paperFoldPackage/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        404: '404.html',
      },
    },
  },
});
```
