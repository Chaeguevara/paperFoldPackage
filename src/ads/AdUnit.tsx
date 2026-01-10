import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

// Replace with your AdSense client ID
const AD_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';

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

  // Don't render in development
  if (import.meta.env.DEV) {
    return (
      <div className={`ad-placeholder ${className}`}>
        <span>Ad: {slot}</span>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}
