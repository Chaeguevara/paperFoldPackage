# SEO Reference

## Essential Meta Tags

```html
<!-- Primary -->
<title>Page Title - Brand Name</title>
<meta name="description" content="150-160 character description">
<link rel="canonical" href="https://example.com/page">

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://example.com/page">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/image.jpg">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

## Schema.org Structured Data

### WebApplication (for this project)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Paper Fold Package Designer",
  "description": "Design paper folding patterns and export to SVG or STL",
  "url": "https://username.github.io/paperFoldPackage",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### HowTo (for tutorial pages)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Paper Fold Box",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Select Template",
      "text": "Choose a box template from the gallery"
    },
    {
      "@type": "HowToStep",
      "name": "Customize Dimensions",
      "text": "Adjust width, height, and depth"
    }
  ]
}
```

## sitemap.xml Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://username.github.io/paperFoldPackage/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://username.github.io/paperFoldPackage/templates</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## robots.txt Format

```
User-agent: *
Allow: /

Sitemap: https://username.github.io/paperFoldPackage/sitemap.xml
```

## GitHub Pages SPA 404 Redirect

Since GitHub Pages doesn't support server-side routing, use this hack:

**404.html** - Saves path to sessionStorage and redirects to index:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
</html>
```

**index.html** - Restores the path:
```html
<script>
  (function(){
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

## Pre-rendering Options

| Tool | Framework | Notes |
|------|-----------|-------|
| vite-plugin-ssr | Vite | SSG mode |
| react-snap | React | Post-build snapshot |
| prerender-spa-plugin | Webpack | Puppeteer-based |

## Crawler Behavior

| Crawler | JS Execution | Notes |
|---------|--------------|-------|
| Googlebot | Yes (delayed) | May miss dynamic content |
| Bingbot | Limited | Prerender recommended |
| Social crawlers | No | Require static meta tags |

## Core Web Vitals Targets

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP | ≤2.5s | ≤4s | >4s |
| FID | ≤100ms | ≤300ms | >300ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |
