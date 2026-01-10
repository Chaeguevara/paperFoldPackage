/**
 * Sitemap Generator for GitHub Pages
 * Run: npx ts-node scripts/generate-sitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface SitemapEntry {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const BASE_URL = 'https://username.github.io/paperFoldPackage';

const routes: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/templates', changefreq: 'weekly', priority: 0.8 },
  { path: '/editor', changefreq: 'monthly', priority: 0.7 },
  { path: '/about', changefreq: 'monthly', priority: 0.5 },
];

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];

  const urls = routes.map(({ path, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;
}

// Main execution
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemap());
fs.writeFileSync(path.join(publicDir, 'robots.txt'), generateRobotsTxt());

console.log('Generated sitemap.xml and robots.txt in public/');
