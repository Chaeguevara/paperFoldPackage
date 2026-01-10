import { useEffect } from 'react';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    script.id = 'structured-data';
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('structured-data');
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, [data]);

  return null;
}

// Default app schema
export const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Paper Fold Package Designer",
  "description": "Design paper folding patterns with 3D visualization. Export to SVG or STL.",
  "url": "https://chaeguevara.github.io/paperFoldPackage",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript and WebGL",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "3D pattern visualization",
    "SVG export for cutting",
    "STL export for 3D printing",
    "Customizable dimensions"
  ]
};
