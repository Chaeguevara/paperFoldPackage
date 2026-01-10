/**
 * AdSense Configuration Helper
 * Centralized ad slot configuration
 */

export interface AdSlotConfig {
  id: string;
  name: string;
  format: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
  responsive: boolean;
  lazyLoad: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

// Replace with your actual ad slots from AdSense dashboard
export const AD_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

export const AD_SLOTS: Record<string, AdSlotConfig> = {
  headerLeaderboard: {
    id: '1111111111',
    name: 'Header Leaderboard',
    format: 'horizontal',
    responsive: true,
    lazyLoad: false, // Above fold, load immediately
    desktopOnly: true,
  },
  sidebarTop: {
    id: '2222222222',
    name: 'Sidebar Top Rectangle',
    format: 'rectangle',
    responsive: false,
    lazyLoad: false,
    desktopOnly: true,
  },
  sidebarBottom: {
    id: '3333333333',
    name: 'Sidebar Bottom Rectangle',
    format: 'rectangle',
    responsive: false,
    lazyLoad: true, // Below fold
    desktopOnly: true,
  },
  footerResponsive: {
    id: '4444444444',
    name: 'Footer Responsive',
    format: 'auto',
    responsive: true,
    lazyLoad: true,
  },
  mobileAnchor: {
    id: '5555555555',
    name: 'Mobile Anchor',
    format: 'horizontal',
    responsive: true,
    lazyLoad: false,
    mobileOnly: true,
  },
};

/**
 * Get ad slot by name with device filtering
 */
export function getAdSlot(
  name: keyof typeof AD_SLOTS,
  isMobile: boolean
): AdSlotConfig | null {
  const slot = AD_SLOTS[name];

  if (!slot) return null;
  if (slot.mobileOnly && !isMobile) return null;
  if (slot.desktopOnly && isMobile) return null;

  return slot;
}

/**
 * Check if ads should be shown (e.g., for premium users)
 */
export function shouldShowAds(user?: { isPremium?: boolean }): boolean {
  if (user?.isPremium) return false;
  return true;
}

/**
 * Initialize AdSense (call once on app load)
 */
export function initAdSense(): void {
  if (typeof window === 'undefined') return;

  // Ensure adsbygoogle array exists
  window.adsbygoogle = window.adsbygoogle || [];
}
