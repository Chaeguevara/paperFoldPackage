# AdSense Implementation Examples

## Basic Ad Unit Component (React)

```tsx
import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
  responsive?: boolean;
  className?: string;
}

export function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (adRef.current && !isLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}
```

## Lazy-Loaded Ad Unit

```tsx
import { useEffect, useRef, useState } from 'react';

export function LazyAdUnit({ slot, ...props }: AdUnitProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: 90 }}>
      {isVisible && <AdUnit slot={slot} {...props} />}
    </div>
  );
}
```

## Page Layout with Ads

```tsx
import { AdUnit, LazyAdUnit } from './AdUnit';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      {/* Header Ad */}
      <header className="header">
        <nav>{/* Navigation */}</nav>
        <AdUnit slot="1111111111" format="horizontal" />
      </header>

      <div className="main-container">
        {/* Sidebar with Ads */}
        <aside className="sidebar">
          <AdUnit slot="2222222222" format="rectangle" />

          <nav className="sidebar-nav">
            {/* Sidebar content */}
          </nav>

          <LazyAdUnit slot="3333333333" format="rectangle" />
        </aside>

        {/* Main Content (Three.js Canvas) */}
        <main className="content">
          {children}
        </main>
      </div>

      {/* Footer Ad */}
      <footer className="footer">
        <LazyAdUnit slot="4444444444" format="auto" responsive />
        <p>Footer content</p>
      </footer>
    </div>
  );
}
```

## CSS for Ad Layout

```css
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content {
  flex: 1;
  min-width: 0; /* Prevent flex overflow */
}

/* Responsive: Hide sidebar ads on mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-container {
    flex-direction: column;
  }
}

/* Ad container styling */
.adsbygoogle {
  background: #f5f5f5;
  min-height: 90px;
}
```

## Conditional Rendering (Premium Users)

```tsx
import { useUser } from './hooks/useUser';

export function ConditionalAd({ slot }: { slot: string }) {
  const { isPremium } = useUser();

  // Don't show ads to premium users
  if (isPremium) {
    return null;
  }

  return <AdUnit slot={slot} />;
}
```

## Mobile-Specific Layout

```tsx
import { useMediaQuery } from './hooks/useMediaQuery';

export function ResponsiveAdLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="layout">
      {/* Mobile: Sticky anchor ad at bottom */}
      {isMobile && (
        <div className="mobile-anchor-ad">
          <AdUnit slot="5555555555" format="horizontal" />
        </div>
      )}

      {/* Desktop: Standard layout */}
      {!isMobile && (
        <aside className="desktop-sidebar">
          <AdUnit slot="2222222222" format="rectangle" />
        </aside>
      )}

      <main>{children}</main>
    </div>
  );
}
```

## TypeScript Declarations

```typescript
// types/adsense.d.ts
declare global {
  interface Window {
    adsbygoogle: {
      push: (config: Record<string, unknown>) => void;
      loaded?: boolean;
    }[];
  }
}

export {};
```
