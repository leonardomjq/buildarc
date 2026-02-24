# buildarc

CLI tool that reads Claude Code conversation transcripts (`.jsonl` files) and generates build journals and social content.

**One-liner:** "Your build story, recovered."

## Commands

```bash
pnpm dev              # Start landing page dev server (Turbopack)
pnpm build            # Production build (landing page)
pnpm build:cli        # Compile CLI (src/ -> dist/)
pnpm typecheck        # TypeScript type checking (tsc --noEmit)
pnpm test             # Run test suite (vitest)
pnpm test:watch       # Run tests in watch mode
pnpm lint             # Check code style (Biome)
pnpm lint:fix         # Auto-fix code style issues
pnpm release:patch    # Bump patch, publish (bug fixes)
pnpm release:minor    # Bump minor, publish (new features)
```

When done making changes, run `pnpm typecheck && pnpm test && pnpm lint` to verify.

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

### CLI pipeline

Two layers: extraction (heuristic, instant) and storytelling (AI via user's `claude` CLI).

1. **Parser** (`src/parser.ts`) -- Stream `.jsonl` files line-by-line, filter to user (string content, no command tags) and assistant (text blocks >= 20 chars + tool_use names) events, group into sessions. Returns skip stats for malformed line warnings.
2. **Extractor** (`src/extractor.ts`) -- Regex-based classification of key moments (DECISION, PIVOT, EMOTION, DIRECTIVE, QUESTION). Runs scrubber on excerpts. Computes stats, groups by date.
3. **Scrubber** (`src/scrubber.ts`) -- Detects and redacts API keys, tokens, connection strings, and env secrets from moment excerpts before they reach shareable content.
4. **Formatter** (`src/formatter.ts`) -- Outputs extraction as Markdown (BUILDARC.md) or JSON (buildarc.json). This is the structured data layer.
5. **Prompts** (`src/prompts.ts`) -- Storytelling prompt templates for tweet/linkedin/journal as embedded string constants
6. **Storyteller** (`src/storyteller.ts`) -- Spawns `claude -p --system-prompt <prompt> --model sonnet` with extraction as stdin. Returns polished social content. Graceful fallback if `claude` CLI isn't installed.
7. **CLI** (`src/cli.ts`) -- Entry point. Arg parsing, auto-detect project, orchestration, interactive menu, extraction caching (skips re-parse on re-runs if BUILDARC.md is fresh).

### CLI flags

```
--format md|json     Extraction output format (default: md)
--since DATE         Filter sessions after date
--sessions N         Last N sessions only
--output, -o DIR     Output directory (default: .buildarc/)
--no-ai              Extraction only, skip storytelling
--tweet              Generate X/Twitter thread (skips menu)
--linkedin           Generate LinkedIn post (skips menu)
--journal            Generate build journal (skips menu)
--style <name>       Content style variant (tweet: narrative|shitpost)
-q, --quiet          Minimal output
```

Flags are combinable: `buildarc --tweet --linkedin` generates both without the interactive menu. On re-runs with content flags, reuses fresh extraction instead of re-parsing.

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

