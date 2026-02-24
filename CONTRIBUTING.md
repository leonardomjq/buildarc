# Contributing to buildarc

## Setup

```bash
git clone https://github.com/leonardomjq/buildarc.git
cd buildarc
pnpm install
```

## Dev commands

```bash
pnpm build:cli        # Compile CLI (src/ -> dist/)
pnpm typecheck        # TypeScript type checking
pnpm test             # Run test suite (vitest)
pnpm test:watch       # Tests in watch mode
pnpm lint             # Check code style (Biome)
pnpm lint:fix         # Auto-fix code style
pnpm dev              # Landing page dev server
```

Before submitting changes, run:

```bash
pnpm typecheck && pnpm test && pnpm lint
```

## Architecture

Two build targets in one repo:

- **`src/` -> `dist/`** — CLI tool, compiled via `tsc -p tsconfig.cli.json`, published to npm. Pure Node.js, zero runtime dependencies.
- **`app/`** — Next.js landing page, deployed to Vercel. Uses `lib/`, `components/`.

They don't share code.

### CLI pipeline

1. **Parser** (`src/parser.ts`) — Streams `.jsonl` files, filters events, groups into sessions
2. **Extractor** (`src/extractor.ts`) — Classifies moments (DECISION, PIVOT, EMOTION, DIRECTIVE, QUESTION)
3. **Scrubber** (`src/scrubber.ts`) — Redacts secrets from moment excerpts
4. **Formatter** (`src/formatter.ts`) — Outputs Markdown or JSON
5. **Prompts** (`src/prompts.ts`) — Storytelling prompt templates
6. **Storyteller** (`src/storyteller.ts`) — Spawns `claude` CLI for content generation
7. **CLI** (`src/cli.ts`) — Entry point, orchestration, interactive menu

## Code style

Enforced by [Biome](https://biomejs.dev/). Key conventions:

- **File names:** `kebab-case.ts`
- **Components:** `PascalCase`
- **Functions/variables:** `camelCase`
- **Imports:** Use `import type` for type-only imports
- **CLI code** (`src/`): Relative imports, Node built-ins only
- **Next.js code** (`app/`, `lib/`, `components/`): `@/` path alias
- **Quotes:** Double quotes
- **Semicolons:** Always
- **Trailing commas:** Always
- **Indent:** 2 spaces

## Hard constraints

- **Zero runtime dependencies** for the CLI. Node built-ins only. This is non-negotiable — it's a core design decision that keeps `npx buildarc` fast.
- **Tests must pass.** The CI runs `pnpm typecheck && pnpm test && pnpm lint` on every PR.
- **Secrets stay scrubbed.** Any text that flows from transcripts to shareable content must pass through the scrubber.

## Submitting a PR

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `pnpm typecheck && pnpm test && pnpm lint`
4. Write a clear PR description explaining what and why
5. Submit

Keep PRs focused. One concern per PR.
