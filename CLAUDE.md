# buildarc

CLI tool that reads Claude Code conversation transcripts (`.jsonl` files) and generates build journals and social content.

**One-liner:** "Your build story, recovered."

## Commands

```bash
pnpm dev              # Start landing page dev server (Turbopack)
pnpm build            # Production build (landing page)
pnpm build:cli        # Compile CLI (src/ -> dist/)
pnpm typecheck        # TypeScript type checking (tsc --noEmit)
```

When done making changes, run `pnpm typecheck` to verify.

## Architecture

Two build targets in one repo:

- **`src/` -> `dist/`**: CLI tool, compiled via `tsc -p tsconfig.cli.json`, published to npm as `buildarc`. Pure Node.js, zero runtime dependencies.
- **`app/`**: Next.js landing page, deployed to Vercel. Uses `lib/`, `components/`, `app/globals.css`.

They don't share code. The CLI uses Node built-ins only. The landing page is React/Next.js.

### Key directories

- `src/` -- CLI source (parser, extractor, formatter, types)
- `app/` -- Next.js landing page
- `components/ui/` -- Design system primitives (Button, Card, Badge, Input)
- `components/landing/` -- Landing page sections
- `lib/motion.ts` -- Framer Motion animation presets
- `lib/utils.ts` -- `cn()` Tailwind class merge helper

### CLI pipeline (v1 = no AI, pure heuristics)

1. **Parser** -- Read `.jsonl` files, group events by sessionId, filter to user/assistant types
2. **Extractor** -- Regex-based classification of key moments (DECISION, PIVOT, EMOTION, DIRECTIVE, QUESTION)
3. **Formatter** -- Output as Markdown, JSON, Tweet thread, or LinkedIn post

## Voice & Messaging

The full product marketing context lives in `.claude/product-marketing-context.md`. Hard rules:

**Audience:** Claude Code power users who build in public (or want to). Builders, not "developers" in the enterprise sense. People who ship projects and want to share the journey.

**Core JTBD:** "Turn my AI coding sessions into a story I can share." Not "track developer activity."

**Tone:** Editorial and genuine. Builder-to-builder. Like a journal entry, not a sales page. Understated confidence — the typography and output do the talking. Dry humor welcome. No hype.

**Words to use:** story, journal, sessions, build in public, narrative, decisions, pivots, moments, share, ship, recover, recovered, builder, journey, thread, content, post
**Words to avoid:** pipeline, entities, signals, intelligence, opportunity, demand, monetize, premium, upgrade, analytics, dashboard, tracking

**Key framings:**
- "Your build story, recovered" — not "track your AI sessions"
- "One command" — not "set up your account"
- "`npx buildarc`" IS the CTA — not "Start Free"
- Output examples are the best marketing — show the generated tweet thread, not feature lists
- The ScoutAgent origin story is an asset — honest, relatable, proves dogfooding

**Anti-persona:** People who don't use Claude Code. Enterprise teams with documentation workflows. People who want AI-written blog posts (buildarc extracts, it doesn't ghost-write). People who think building in public is cringe.

## Code style

- File names: `kebab-case.ts`. Components: `PascalCase`. Functions/variables: `camelCase`.
- Next.js code uses `@/` path alias. CLI code in `src/` uses relative imports.
- Use `import type` for type-only imports.
- Server components by default. Add `"use client"` only when needed.
- Named exports for everything except page components (default export).
- Always use design tokens from `globals.css` -- never hardcode hex colors.
- Use `cn()` from `@/lib/utils` for Tailwind class merging.
- Animation presets from `lib/motion.ts` -- never inline raw Framer Motion objects.
- Icons from `lucide-react` only.
- Reference `DESIGN_SYSTEM.md` for color palette, typography, spacing, and component patterns.

## Design system

Dark theme is always on (`class="dark"` on `<html>`). Design tokens defined via CSS `@theme` in `globals.css`, not a Tailwind config file.

See `DESIGN_SYSTEM.md` for full reference: color palette, 4-font typography hierarchy, motion presets, section patterns, textures, glass morphism.

## Full specs

See `BUILDLOG-HANDOFF.md` for complete product specs: CLI arguments, transcript format, extraction strategy, output format examples, landing page plan, and launch plan.
