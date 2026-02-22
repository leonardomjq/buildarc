# ScoutAgent Design System

Dark, warm, sophisticated. Teal-green signal accents. Intelligence briefing aesthetic.

---

## 1. Color Palette

All colors are CSS custom properties defined in `app/globals.css` via `@theme`.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0A` | Page background |
| `surface` | `#151515` | Cards, sections, panels |
| `surface-elevated` | `#1A1A1A` | Hover states, raised elements |
| `surface-glass` | `rgba(255,255,255,0.03)` | Glass morphism panels |
| `border` | `#222222` | Default borders |
| `text` | `#F5F5F0` | Primary text (warm off-white) |
| `text-muted` | `#8A9EA0` | Secondary text (blue-gray) |
| `text-dim` | `#525252` | Labels, dividers, timestamps |
| `accent-green` | `#00E5B3` | Primary accent — signals, CTAs, success |
| `accent-orange` | `#FF6B35` | Urgency, deadlines, scarcity |
| `accent-red` | `#FF3366` | Errors, danger, negative signals |
| `accent-amber` | `#FFB800` | Warnings, caution |
| `accent-blue` | `#00AAFF` | Info, links, neutral highlights |

Usage: `text-accent-green`, `bg-surface`, `border-text-dim/30`, etc.

---

## 2. Typography

Four-font hierarchy loaded via `next/font` in the root layout:

| Role | Font | CSS variable | Usage |
|------|------|-------------|-------|
| Display | Space Grotesk | `--font-display` | Headlines, section titles |
| Body | IBM Plex Serif | `--font-serif` | Paragraphs, descriptions, evidence |
| Data | JetBrains Mono | system `font-mono` | Labels, badges, stats, code |
| UI | Inter | system default | Buttons, navigation, form elements |

### Size scale
- Section label: `text-[10px] font-mono uppercase tracking-widest`
- Body: `text-sm` (14px)
- Section heading: `text-2xl sm:text-3xl md:text-4xl font-bold`
- Hero heading: `text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem]`
- Stat number: `text-lg font-bold font-mono`

---

## 3. Spacing

Consistent padding/gap patterns:

| Context | Value |
|---------|-------|
| Section padding | `px-6 py-20` |
| Card padding (compact) | `p-4` |
| Card padding (default) | `p-5` |
| Card padding (spacious) | `p-6` |
| Grid gap | `gap-6` (cards), `gap-8` (sections) |
| Element spacing | `mb-2` (tight), `mb-4` (normal), `mb-6` (loose), `mb-12` (section) |
| Max content width | `max-w-3xl` (narrow), `max-w-4xl` (medium), `max-w-5xl` (wide) |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Badges, tags |
| `rounded` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Cards, panels |
| `rounded-full` | 9999px | Pills, avatars |

---

## 5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-subtle` | `0 1px 2px rgba(0,0,0,0.4)` | Slight depth |
| `shadow-elevated` | `0 4px 12px rgba(0,0,0,0.5)` | Floating elements |
| `shadow-glow` | `0 0 30px -10px rgba(0,229,179,0.15)` | Accent glow (Pro cards, CTAs) |

Custom glow: `shadow-[0_0_40px_-10px_rgba(0,229,179,0.15)]` for larger glow radius.

---

## 6. Textures

Utility classes for subtle background patterns:

| Class | Effect |
|-------|--------|
| `texture-graph` | 40px grid lines (0.03 opacity) |
| `texture-paper` | Horizontal scan lines (0.02 opacity) |
| `texture-noise` | Fractal noise grain (0.04 opacity) |

Apply to cards and sections for the intelligence-briefing feel. `texture-paper` is most common on landing cards.

---

## 7. Glass Morphism

Pattern for elevated surfaces:
```
bg-surface-glass backdrop-blur-xl border border-border
```

For sticky nav/overlays:
```
bg-surface/80 backdrop-blur-md
```

---

## 8. Motion

All presets in `lib/motion.ts`. Never inline raw Framer Motion objects.

### Basic
| Preset | Usage |
|--------|-------|
| `fadeInUp` | Simple fade + slide for dashboard elements |
| `staggerContainer` / `staggerItem` | List animation (hidden/show states) |
| `viewportFadeIn(delay)` | Scroll-triggered fade with optional delay |

### Premium (clip-path reveals)
| Preset | Usage |
|--------|-------|
| `clipRevealStagger` / `clipRevealItem` | Section content reveals (hidden/visible states) |
| `scanLine` | Horizontal line wipe effect |

### Constants
- `DURATION`: `{ fast: 0.15, normal: 0.2, slow: 0.4 }`
- `EASE`: `{ out: [0.16, 1, 0.3, 1], inOut: [0.4, 0, 0.2, 1] }`

---

## 9. Component API

All components in `components/ui/`. Use `cn()` from `@/lib/utils` for class merging.

### Button
```tsx
<Button variant="primary|secondary|ghost" size="sm|md|lg" />
<ButtonLink variant="primary|secondary|ghost" size="sm|md|lg" href="..." />
```

### Card
```tsx
<Card variant="default|glass" padding="compact|default|spacious" />
```

### Badge
```tsx
<Badge variant="default|success|warning|danger|info" shape="pill|tag" />
```

### Input
```tsx
<Input icon={<SearchIcon />} />
```

---

## 10. Patterns

### Section structure (landing)
```tsx
<section className="px-6 py-20 max-w-5xl mx-auto">
  <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
    Section Label
  </div>
  <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-4">
    Headline
  </h2>
  <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-12">
    Description
  </p>
  {/* Content */}
</section>
```

### Tier gating (blur gate)
```tsx
<div className="relative border-t border-text-dim/20">
  <div className="blur-sm select-none pointer-events-none" aria-hidden>
    {/* Pro content skeleton */}
  </div>
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Lock + upgrade CTA */}
  </div>
</div>
```

### Responsive breakpoints
- Mobile-first. `sm:` (640px), `md:` (768px), `lg:` (1024px).
- Grid: `grid-cols-1 md:grid-cols-2` (pricing), `grid-cols-1 md:grid-cols-3` (steps).
- Text scale: always include `sm:` and `md:` variants for headlines.

### Z-index layers
| Token | Value | Usage |
|-------|-------|-------|
| `z-sticky` | 30 | Sticky headers |
| `z-overlay` | 40 | Floating CTAs, overlays |
| `z-modal` | 50 | Modals, dialogs |
| `z-toast` | 60 | Toast notifications |
