# AdSense Reference

## Script Installation

```html
<!-- In index.html <head> -->
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous">
</script>
```

## Ad Unit HTML Structure

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## Common Ad Sizes

| Name | Dimensions | data-ad-format |
|------|------------|----------------|
| Leaderboard | 728x90 | horizontal |
| Medium Rectangle | 300x250 | rectangle |
| Large Rectangle | 336x280 | rectangle |
| Wide Skyscraper | 160x600 | vertical |
| Mobile Banner | 320x50 | horizontal |
| Responsive | varies | auto |

## Ad Format Options

```html
<!-- Fixed size -->
data-ad-format="rectangle"

<!-- Responsive (recommended) -->
data-ad-format="auto"
data-full-width-responsive="true"

<!-- In-feed -->
data-ad-format="fluid"
data-ad-layout-key="-fb+5w+4e-db+86"
```

## Policy Compliance Checklist

| Rule | Description |
|------|-------------|
| Content quality | Pages must have substantial original content |
| Ad density | Max 1 ad per viewport on mobile |
| Invalid clicks | Never click own ads or encourage clicks |
| Deceptive placement | Ads must be distinguishable from content |
| Prohibited content | No adult, violent, or illegal content |
| Traffic sources | No artificial traffic (bots, click farms) |

## Performance Optimization

### Lazy Load Ads

Load ads only when they enter viewport:

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Load ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });
```

### Async Loading

AdSense script already uses `async`. Ensure it doesn't block:

```html
<!-- Good: async attribute -->
<script async src="..."></script>

<!-- Bad: blocking -->
<script src="..."></script>
```

## TypeScript Declaration

```typescript
// global.d.ts
declare global {
  interface Window {
    adsbygoogle: { push: (config: object) => void }[];
  }
}
```

## Revenue Factors

| Factor | Impact |
|--------|--------|
| Traffic volume | Linear with impressions |
| Geographic location | US/EU pay more |
| Niche | Finance/Tech pay more |
| Ad placement | Above fold = higher |
| Device | Desktop > Mobile typically |
| Season | Q4 highest (holidays) |

## Testing

- Use AdSense sandbox mode in development
- Verify ads appear on different screen sizes
- Check Console for errors
- Monitor Core Web Vitals (ads affect LCP)
