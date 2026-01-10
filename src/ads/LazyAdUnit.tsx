import { useEffect, useRef, useState } from 'react';
import { AdUnit } from './AdUnit';

interface LazyAdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  rootMargin?: string;
}

export function LazyAdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  rootMargin = '200px',
}: LazyAdUnitProps) {
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
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={className} style={{ minHeight: 90 }}>
      {isVisible && (
        <AdUnit slot={slot} format={format} responsive={responsive} />
      )}
    </div>
  );
}
