---
name: adsense-integration
description: Google AdSense integration for web applications. Use when implementing ads, monetization, ad placement, or when user mentions AdSense, advertising, or revenue.
---

# Google AdSense Integration

## Quick Setup

1. Get approved at [adsense.google.com](https://adsense.google.com)
2. Add script to `index.html`
3. Create ad unit components
4. Place strategically (see layout below)

## Ad Unit Types

| Type | Size | Best For |
|------|------|----------|
| Leaderboard | 728x90 | Header |
| Rectangle | 300x250 | Sidebar |
| Responsive | Auto | Mobile, footer |
| In-feed | Auto | Between content |

## Recommended Layout

```
┌─────────────────────────────────┐
│      Leaderboard (728x90)       │
├──────────┬──────────────────────┤
│ Sidebar  │                      │
│ (300x250)│   Main Content       │
│          │   (Three.js Canvas)  │
├──────────┴──────────────────────┤
│     Responsive (footer)         │
└─────────────────────────────────┘
```

## Files in This Skill

- **[reference.md](./reference.md)** - Ad unit specs, policies, performance tips
- **[examples.md](./examples.md)** - React components, lazy loading
- **[scripts/ad-config.ts](./scripts/ad-config.ts)** - Configuration helper

## Policy Reminders

- Max 1 ad per screen on mobile
- Don't click your own ads
- Ensure substantial content exists
- No misleading placement
