import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageMeta {
  title: string;
  description: string;
  image?: string;
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

const BASE_URL = 'https://chaeguevara.github.io/paperFoldPackage';

function updateMeta(name: string, content: string, attr = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function MetaTags() {
  const location = useLocation();

  useEffect(() => {
    const meta = pageMeta[location.pathname] || pageMeta['/'];

    // Title
    document.title = meta.title;

    // Standard meta
    updateMeta('description', meta.description);

    // Open Graph
    updateMeta('og:title', meta.title, 'property');
    updateMeta('og:description', meta.description, 'property');
    updateMeta('og:url', `${BASE_URL}${location.pathname}`, 'property');
    updateMeta('og:type', 'website', 'property');
    if (meta.image) {
      updateMeta('og:image', `${BASE_URL}${meta.image}`, 'property');
    }

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', meta.title);
    updateMeta('twitter:description', meta.description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${BASE_URL}${location.pathname}`);

  }, [location.pathname]);

  return null;
}
