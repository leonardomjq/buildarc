# Buildarc Design System

Editorial grit meets terminal velocity. High-contrast, tactile, and asymmetric. A living build journal.

---

## 1. Color Palette

Primary shifts from "intelligence" to "active builder."

All colors are CSS custom properties defined in `app/globals.css` via `@theme`.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0A` | Page background |
| `surface` | `#111111` | Artifact cards, terminal blocks |
| `surface-glass` | `rgba(255,255,255,0.02)` | Floating social thread cards |
| `border` | `#1F1F1F` | Default borders |
| `text` | `#F5F5F0` | Primary content (warm off-white) |
| `text-muted` | `#949494` | Narrative text, secondary descriptions |
| `text-dim` | `#404040` | Metadata, marginalia, thread lines |
| `accent-blue` | `#00AAFF` | The "Blueprint" accent — highlights, active states |
| `accent-amber` | `#FFB800` | "Decision" moments, pivots |
| `accent-orange` | `#FF6B35` | "Directive" moments, high-impact changes |
| `accent-green` | `#00E5B3` | Success, command execution, npx status |

Usage: `text-accent-green`, `bg-surface`, `border-text-dim/30`, etc.

---

## 2. Typography

The "Editorial Soul" hierarchy. Four fonts loaded via `next/font` in the root layout:

| Role | Font | CSS variable | Usage |
|------|------|-------------|-------|
| Display | Instrument Serif | `--font-display` | Massive, editorial headlines (Hero). Weight 400 only — never use `font-bold`. |
| Narrative | Lora | `--font-serif` | Build stories, "Journal Entry" paragraphs. Variable weight 400–700. |
| Metadata | JetBrains Mono | `font-mono` | Command lines, session counts, dates |
| UI | Inter | system default | Functional buttons, navigation |

### Size scale

- **Marginalia:** `text-[10px] font-mono tracking-widest text-text-dim`
- **Body:** `text-base font-serif leading-relaxed`
- **Artifact Title:** `text-xl font-display`
- **Section Headline:** `text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-[-0.01em]`
- **Hero Headline:** `text-[3rem] sm:text-[4.5rem] md:text-[7rem] leading-[1.05] tracking-[-0.02em]`

---

## 3. Textures (Primary)

These are no longer subtle; they define the "surface" of the tool.

| Class | Effect | Usage |
|-------|--------|-------|
| `texture-paper` | Horizontal scan lines | Apply to all artifact cards to mimic printed logs |
| `texture-noise` | Fractal noise grain | Global body overlay (0.04 opacity) for "ink" feel |
| `texture-ink` | Subtle bleed effect | Apply to large Display headings |

---

## 4. Layout Patterns: The Asymmetric Thread

### The "Vertical Spine"

A 1px vertical line (`bg-text-dim/20`) that anchors the page.

- Aligned to `left: 2rem` on mobile, `left: 15%` on desktop.
- Components "hook" into this line with a horizontal 10px tick.

### The Artifact Stack

Cards should never be perfectly aligned.

- Use `ml-[10%]` for the first card, `mr-[5%]` for the second.
- Use `z-index` and `shadow-elevated` to overlap cards slightly, creating a "scattered on a desk" feel.

---

## 5. Components

### Artifact Card (Social Output)

```tsx
<div className="bg-surface-glass texture-paper border border-border rounded-sm p-6 shadow-elevated">
  <div className="font-mono text-[10px] text-accent-blue mb-4">SESSION_04_PIVOT.jsonl</div>
  <div className="font-serif italic text-text mb-6">"I realized the parser was too slow, so I stripped the dependencies..."</div>
  {/* Social icons + Timestamp */}
</div>
```

### The Command Block

```tsx
<div className="inline-flex items-center gap-3 bg-accent-green text-bg font-mono px-4 py-2 rounded shadow-glow">
  <span className="opacity-70">$</span>
  <span>npx buildarc</span>
</div>
```

### Moment Badge

```tsx
// For highlighting key story beats
<Badge variant="amber" shape="tag">PIVOT</Badge>
<Badge variant="orange" shape="tag">DIRECTIVE</Badge>
```

---

## 6. Motion

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
| `ghostCardStagger` / `ghostCardItem` | Hero tweet card stagger animation |
| `stampReveal` | Stamp/seal reveal effect |

### Constants

- `DURATION`: `{ fast: 0.15, normal: 0.2, slow: 0.4 }`
- `EASE`: `{ out: [0.16, 1, 0.3, 1], inOut: [0.4, 0, 0.2, 1] }`

---

## 7. Component API

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

## 8. Patterns

### Section structure (landing)

```tsx
<section className="relative px-6 py-20">
  <ThreadNode />
  <div className="ml-0 md:ml-24 lg:ml-32 max-w-3xl">
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
  </div>
</section>
```

### Responsive breakpoints

- Mobile-first. `sm:` (640px), `md:` (768px), `lg:` (1024px).
- Grid: `grid-cols-1 md:grid-cols-2` (side-by-side), `grid-cols-1 md:grid-cols-[3fr_2fr]` (before/after).
- Text scale: always include `sm:` and `md:` variants for headlines.

### Z-index layers

| Token | Value | Usage |
|-------|-------|-------|
| `z-sticky` | 30 | Sticky headers |
| `z-overlay` | 40 | Floating CTAs, overlays |
| `z-modal` | 50 | Modals, dialogs |
| `z-toast` | 60 | Toast notifications |
