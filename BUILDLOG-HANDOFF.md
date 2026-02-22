# buildlog — Complete Handoff Document

> **Context:** This project was duplicated from `scout-agent`, a Next.js SaaS app. We're keeping ONLY the landing page shell + design system and building something completely new on top. Everything related to the old product (auth, Appwrite, Stripe, pipeline, dashboard) gets deleted.
>
> **For the new Claude session:** Read this entire file first. Then execute Phase 1 (cleanup) from Section 13. After cleanup, this file becomes your CLAUDE.md-level reference for the buildlog project.

---

## Table of Contents

1. [What is buildlog](#1-what-is-buildlog)
2. [Product decisions already made](#2-product-decisions-already-made)
3. [CLI spec](#3-cli-spec)
4. [Transcript format (researched from real data)](#4-transcript-format-researched-from-real-data)
5. [Extraction strategy](#5-extraction-strategy)
6. [Output formats](#6-output-formats)
7. [Package structure](#7-package-structure)
8. [What to keep from scout-agent (landing page)](#8-what-to-keep-from-scout-agent-landing-page)
9. [What to delete from scout-agent](#9-what-to-delete-from-scout-agent)
10. [Design system reference (carried over)](#10-design-system-reference-carried-over)
11. [Landing page plan for buildlog](#11-landing-page-plan-for-buildlog)
12. [Launch plan](#12-launch-plan)
13. [Step-by-step build order](#13-step-by-step-build-order)
14. [v2 ideas (NOT for v1)](#14-v2-ideas-not-for-v1)

---

## 1. What is buildlog

CLI tool that reads Claude Code conversation transcripts (`.jsonl` files) and generates:
- A structured build journal (`BUILDLOG.md`) — the story of how a project evolved
- **Ready-to-post social content** for X/Twitter threads and LinkedIn posts

**One-liner:** "git log for your AI coding sessions."

**The pain it solves:** "You're told to build in public, but after 50 Claude Code sessions you have no idea where to start because the story of your project disappeared between sessions."

This is a NEW pain that didn't exist before AI coding assistants. When you build with Claude Code across dozens of sessions, the narrative disappears.

---

## 2. Product decisions already made

### Pricing: FREE and open-source
- **Do NOT charge for this.** We already learned with ScoutAgent that charging for synthesis of freely available data doesn't work.
- The raw material (.jsonl files) belongs to the user. They could paste transcripts into Claude manually.
- CLI tools are notoriously hard to monetize. Indie hackers expect them free.
- The real value is: portfolio piece, content engine (we use it to build in public), audience builder.

### Social media formatting is the differentiator
- Nobody else does "JSONL transcripts -> ready-to-post build updates"
- This is what makes it shareable and gets attention on Show HN / Twitter
- Output formats: `--format md` (default), `--format tweet`, `--format linkedin`, `--format json`

### v1 = No AI, pure heuristics
- Extraction uses regex pattern matching, not LLM calls
- Zero runtime dependencies (Node built-ins only: fs, path, readline)
- This keeps it fast, free, and simple

### The project has TWO parts
1. **The CLI tool** — the actual `npx buildlog` npm package (build first)
2. **A landing page** — marketing site built from scout-agent's design system (build second)

---

## 3. CLI spec

```
Usage: buildlog [path] [options]

Arguments:
  path              Path to .claude/projects/<project>/ directory
                    Default: auto-detect from current directory

Options:
  --format md|json|tweet|linkedin   Output format (default: md)
  --since DATE      Only include sessions after this date (YYYY-MM-DD)
  --sessions N      Only include last N sessions
  --output FILE     Output file (default: BUILDLOG.md, or stdout for json/tweet/linkedin)
  -q, --quiet       Suppress progress logs
  -h, --help        Show help
  -v, --version     Show version

Examples:
  buildlog                              # Auto-detect project, output BUILDLOG.md
  buildlog ~/.claude/projects/my-proj/  # Specific project directory
  buildlog --sessions 10                # Last 10 sessions only
  buildlog --format tweet               # Generate X/Twitter thread
  buildlog --format linkedin            # Generate LinkedIn post
  buildlog --format json --output -     # JSON to stdout
```

### Auto-detect logic
1. From cwd, check if `~/.claude/projects/` exists
2. Encode cwd as project slug: `/Users/leo/my-app` -> `-Users-leo-my-app`
3. Look for matching directory in `~/.claude/projects/`
4. If found, use it. If not, list available projects and let user pick.

### npm package config
```json
{
  "name": "buildlog",
  "version": "0.1.0",
  "bin": { "buildlog": "./dist/cli.js" },
  "type": "module",
  "engines": { "node": ">=18" },
  "files": ["dist"],
  "keywords": ["claude-code", "build-in-public", "dev-journal", "cli", "ai-coding", "transcript"]
}
```

Zero runtime dependencies. Node built-ins only (fs, path, readline).

---

## 4. Transcript format (researched from real data)

### Location
`~/.claude/projects/<encoded-project-path>/` contains `.jsonl` files, one per session.

The encoded path replaces `/` with `-`. So `/Users/leo/projects/my-app` becomes `-Users-leo-projects-my-app`.

### File stats (from ScoutAgent as test data)
- 217 .jsonl files total
- 73 are empty/minimal (~18 bytes)
- Size range: 18 bytes to 2.9 MB
- Median: ~400-600 KB

### JSONL line types

Each line is a JSON object. Five main types:

#### 1. `user` — User messages (EXTRACT THESE)
```json
{
  "type": "user",
  "timestamp": "2026-02-20T15:58:52.043Z",
  "sessionId": "c1bfa67f-...",
  "slug": "velvety-mixing-walrus",
  "gitBranch": "main",
  "cwd": "/Users/.../scout-agent",
  "version": "2.1.49",
  "isMeta": false,
  "message": {
    "role": "user",
    "content": "Implement the authentication flow"
  }
}
```
- `message.content` is a **string** for actual user input
- `message.content` is an **array** for auto-generated tool results (SKIP these)
- `isMeta: true` means auto-generated (SKIP these too)

#### 2. `assistant` — Claude responses (EXTRACT text + tool names)
```json
{
  "type": "assistant",
  "timestamp": "2026-02-20T15:58:52.021Z",
  "sessionId": "...",
  "slug": "velvety-mixing-walrus",
  "gitBranch": "main",
  "message": {
    "model": "claude-opus-4-6",
    "role": "assistant",
    "content": [
      { "type": "text", "text": "I'll implement the auth flow..." },
      { "type": "tool_use", "name": "Write", "input": { "file_path": "..." } },
      { "type": "thinking", "thinking": "Internal reasoning..." }
    ],
    "usage": { "input_tokens": 3, "output_tokens": 12 }
  }
}
```
- `content` is always an array of blocks: `text`, `tool_use`, `thinking`
- Extract `text` blocks for narrative, `tool_use` names for "what was built"
- SKIP `thinking` blocks (internal reasoning, not part of the story)

#### 3. `progress` — Hook/tool progress events (SKIP entirely)

#### 4. `system` — Local commands like /mcp, /skills (SKIP entirely)

#### 5. `file-history-snapshot` — File state tracking (SKIP entirely)

### Common fields across all types
| Field | Description |
|-------|-------------|
| `type` | Event type |
| `timestamp` | ISO 8601 |
| `sessionId` | Groups events into a session |
| `slug` | Human-readable session name (e.g., "velvety-mixing-walrus") |
| `gitBranch` | Active git branch |
| `cwd` | Working directory |
| `version` | Claude Code version |
| `uuid` | Unique event ID |
| `parentUuid` | Parent event (for threading) |

---

## 5. Extraction strategy

### What to extract
Focus on **user messages** (these contain decisions and intent):
- **Decisions**: "let's go with X", "I decided", "going to build X"
- **Pivots**: "actually let's do Y instead", "scrap this", "new approach"
- **Questions**: messages ending with `?`
- **Directives**: "implement X", "build X", "add X", "fix X"
- **Emotions**: "frustrated", "excited", "love this", "stuck", "breakthrough"

### What to skip
- `tool_result` content (huge, mostly file contents)
- `progress` events
- `file-history-snapshot` events
- User messages where `isMeta: true`
- User messages where `message.content` is an array (tool results)
- Assistant `thinking` blocks
- Very short assistant text blocks (< 20 chars)

### Heuristic regex patterns
```
DECISION:  /let's (go with|do|use|try|build|ship)/i, /I decided/i, /going to (build|ship|create)/i
PIVOT:     /pivot/i, /change (direction|approach)/i, /scrap (this|that)/i, /instead of/i
EMOTION:   /frustrat(ed|ing)/i, /excit(ed|ing)/i, /love (this|that)/i, /stuck/i, /breakthrough/i
DIRECTIVE: /(implement|build|create|add|fix|update|remove|refactor|deploy|ship|write)\s+/i
QUESTION:  /\?$/m
```

### Session summary heuristic (no AI)
For each session, generate 1-3 sentences:
1. First user message = what the user wanted
2. Count of decisions/pivots/questions
3. Key tools used (Write = built something, Edit = modified, Bash = ran commands)

---

## 6. Output formats

### Markdown (default) — BUILDLOG.md
```markdown
# ~/projects/personal/scout-agent

*Generated by buildlog — 2026-02-22*

> **45 sessions** | **12h 30m total** | **87 key moments** | Jan 15 – Feb 22, 2026

---

## Jan 15, 2026

### 14:30 — *velvety-mixing-walrus* (45 min) `main`

- **[DIRECTIVE]** Implement the authentication flow using Appwrite
- **[DECISION]** Let's use cookie-based sessions instead of JWT
- **[QUESTION]** Should we use server actions or route handlers for auth?
- **[DECISION]** Going to use route handlers for cookie-setting ops

  *Tools: Write, Edit, Bash, Read*

### 16:00 — *majestic-orbiting-stearns* (1h 20m) `feat/stripe`

- **[DIRECTIVE]** Add Stripe integration for subscriptions
- **[PIVOT]** Actually let's scrap the lifetime deal, go with monthly
- **[EMOTION]** This is exciting, the whole payment flow works now

  *Tools: Write, Edit, Bash, Read, Glob*

---
```

### Tweet format (X/Twitter thread)
```
1/ Building ScoutAgent in public — here's the story so far

From "I'll just build a signal tracker" to "wait, should we pivot?"

45 sessions, 87 key moments, 6 weeks of AI-assisted building 🧵

2/ Week 1: Started with authentication
- Chose Appwrite over Supabase
- Cookie-based sessions (not JWT)
- Built the full signup/login flow in 2 sessions

3/ Week 2: The pipeline
- Three-layer AI pipeline: noise filter → pattern matching → strategy
- Used Claude Haiku for cheap extraction, Sonnet for synthesis
- This was the hardest part

4/ The pivot moment
- Realized the Twitter API costs $200/mo
- Switched to free sources (HN, Reddit, GitHub, PH)
- Got 250 signals per run for $0

5/ What I learned
- Don't build what people won't pay for
- Validate BEFORE you build the product
- AI coding assistants change the game — 45 sessions of history I almost lost

Generated with buildlog — npx buildlog
```

### LinkedIn format
```
I've been building a project called ScoutAgent for the past 6 weeks using Claude Code.

45 AI-assisted coding sessions. 87 key moments. And one brutal pivot.

Here's the story:

**Week 1-2: The Foundation**
Set up authentication with Appwrite, chose cookie-based sessions over JWT. Built a three-layer AI pipeline that filters noise, detects patterns, and synthesizes business opportunities.

**The Hard Part**
Discovered the Twitter API costs $200/mo. Had to pivot to free sources. This single discovery changed the entire product direction.

**What I Learned**
Building with AI coding assistants is powerful, but the story of your project disappears between sessions. That's why I built buildlog — a CLI that turns your Claude Code transcripts into a structured build journal.

Try it: npx buildlog

#buildinpublic #indiehacker #ai #claudecode
```

### JSON format
```json
{
  "project": "~/projects/personal/scout-agent",
  "generated_at": "2026-02-22T...",
  "stats": {
    "total_sessions": 45,
    "total_duration_minutes": 750,
    "key_moments": 87,
    "date_range": { "start": "2026-01-15", "end": "2026-02-22" }
  },
  "sessions": [
    {
      "date": "2026-01-15",
      "time": "14:30",
      "slug": "velvety-mixing-walrus",
      "branch": "main",
      "duration_minutes": 45,
      "moments": [
        { "type": "DIRECTIVE", "text": "Implement the authentication flow using Appwrite" },
        { "type": "DECISION", "text": "Let's use cookie-based sessions instead of JWT" }
      ],
      "tools_used": ["Write", "Edit", "Bash", "Read"]
    }
  ]
}
```

---

## 7. Package structure (after cleanup)

```
buildlog/
├── package.json              # Single package — CLI bin + Next.js scripts
├── tsconfig.json             # Next.js (app/, lib/, components/)
├── tsconfig.cli.json         # CLI only (src/ -> dist/)
├── next.config.ts
├── postcss.config.mjs
├── BUILDLOG-HANDOFF.md       # This file (reference, delete when done)
├── DESIGN_SYSTEM.md          # Design reference
├── README.md                 # New readme for the npm package
├── LICENSE (MIT)
│
├── src/                      # CLI tool (compiled to dist/, published to npm)
│   ├── cli.ts                #   Entry point — arg parsing, auto-detect, orchestration
│   ├── parser.ts             #   Read .jsonl files, parse into sessions
│   ├── extractor.ts          #   Heuristic extraction of key moments
│   ├── formatter.ts          #   Markdown + JSON + Tweet + LinkedIn formatting
│   └── types.ts              #   TypeScript types
│
├── dist/                     # CLI compiled output (git-ignored)
│
├── app/                      # Next.js landing page (deployed to Vercel)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (legal)/
│
├── components/               # Landing page components
│   ├── ui/                   #   Design primitives
│   ├── landing/              #   Landing sections
│   ├── toast.tsx
│   └── logo.tsx
│
└── lib/                      # Shared utilities (used by landing page)
    ├── motion.ts
    └── utils.ts
```

Two separate build targets in one repo:
- **`src/` -> `dist/`**: CLI tool, compiled via `tsc -p tsconfig.cli.json`, published to npm as `buildlog`
- **`app/`**: Next.js landing page, deployed to Vercel. Uses `lib/`, `components/`, `app/globals.css`

They don't share code. The CLI is pure Node.js (zero deps). The landing page is React/Next.js.

---

## 8. What to keep from scout-agent (landing page)

### Files to KEEP (modify content, keep structure):

```
# Design system
app/globals.css                       # Design tokens — KEEP AS-IS
lib/motion.ts                         # Framer Motion presets — KEEP AS-IS
lib/utils.ts                          # cn() helper — KEEP AS-IS
DESIGN_SYSTEM.md                      # Reference doc — KEEP AS-IS

# UI primitives
components/ui/button.tsx              # Button + ButtonLink — KEEP AS-IS
components/ui/card.tsx                # Card component — KEEP AS-IS
components/ui/badge.tsx               # Badge component — KEEP AS-IS
components/ui/input.tsx               # Input component — KEEP AS-IS

# Layout
app/layout.tsx                        # Root layout — MODIFY (update metadata, remove Appwrite auth)
app/page.tsx                          # Landing page — REWRITE for buildlog
app/robots.ts                         # SEO — MODIFY domain
app/sitemap.ts                        # SEO — MODIFY routes
app/error.tsx                         # Error boundary — KEEP
app/global-error.tsx                  # Global error — KEEP
app/not-found.tsx                     # 404 page — KEEP

# Landing sections (use as TEMPLATES, rewrite content)
components/landing/intelligence-briefing.tsx  # -> Hero section
components/landing/problem-agitation.tsx      # -> Problem section
components/landing/alpha-cards-showcase.tsx   # -> Demo/output showcase
components/landing/social-proof.tsx           # -> Social proof
components/landing/final-cta.tsx              # -> Final CTA
components/landing/landing-footer.tsx         # -> Footer
components/landing/section-cta.tsx            # -> Reusable CTA button
components/landing/sticky-cta.tsx             # -> Floating CTA

# Toast system
components/toast.tsx                  # Toast notifications — KEEP AS-IS

# Logo
components/logo.tsx                   # MODIFY to "buildlog" branding

# Legal (boilerplate)
app/(legal)/layout.tsx                # KEEP
app/(legal)/privacy/page.tsx          # MODIFY for buildlog
app/(legal)/terms/page.tsx            # MODIFY for buildlog

# Config
next.config.ts                        # MODIFY (remove Stripe/Appwrite CSP domains)
tsconfig.json                         # KEEP AS-IS
postcss.config.mjs                    # KEEP AS-IS
package.json                          # HEAVY MODIFY (see below)
```

### package.json — what to keep vs remove

**KEEP these dependencies** (for landing page):
```json
{
  "next": "^16.1.6",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "tailwindcss": "^4.2.0",
  "@tailwindcss/postcss": "^4.2.0",
  "postcss": "^8.5.6",
  "tailwind-merge": "^3.5.0",
  "clsx": "^2.1.1",
  "framer-motion": "^12.34.2",
  "lucide-react": "^0.574.0",
  "typescript": "^5.9.3",
  "@types/node": "^25.2.3",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3"
}
```

**DELETE these dependencies:**
```
@anthropic-ai/sdk, node-appwrite, stripe, zod, uuid, swr,
@upstash/ratelimit, @upstash/redis, p-limit,
@playwright/test, @testing-library/jest-dom, @testing-library/react,
@types/uuid, @vitejs/plugin-react, jsdom, vitest
```

---

## 9. What to delete from scout-agent

### Directories to delete entirely:
```
lib/appwrite/          # Appwrite integrations
lib/refinery/          # ML pipeline
lib/stripe/            # Stripe integrations
lib/ingest/            # Webhook ingestion
lib/auth/              # Auth helpers (cookie, csrf)
schemas/               # Zod schemas
types/                 # Type re-exports
hooks/                 # App-specific hooks
scripts/               # Setup scripts
e2e/                   # E2E tests
__fixtures__/          # Test data
memory/                # Project memory files
app/(auth)/            # Auth pages (login, signup, etc.)
app/(dashboard)/       # Dashboard pages (feed, alpha, pulse, saved, settings)
app/api/               # ALL API routes (auth, stripe, ingest, cron, etc.)
components/settings/   # Settings components
```

### Individual files to delete:
```
# Lib files
lib/ai.ts              # Anthropic client
lib/ai.test.ts         # Anthropic test
lib/fetcher.ts         # SWR fetcher
lib/rate-limit.ts      # Rate limiter
lib/rate-limit.test.ts # Rate limiter test

# Components (old product)
components/alpha-*          # Alpha card components (3 files)
components/dashboard-*      # Dashboard shell
components/sidebar-*        # Sidebar
components/saved-*          # Saved feed
components/pulse-*          # Pulse components (2 files)
components/bookmark-*       # Bookmark button
components/upgrade-*        # Upgrade/paywall (3 files)
components/oauth-*          # OAuth buttons
components/auth-shell*      # Auth shell
components/blur-gate*       # Blur gate
components/inline-*         # Inline upgrade hints
components/breadcrumbs.tsx         # Dashboard breadcrumbs
components/card-skeleton.tsx       # Card loading skeleton
components/change-password-form.tsx # Password form
components/copy-link-button.tsx    # Copy link
components/delete-account-button.tsx # Account deletion
components/manage-subscription-button.tsx # Stripe subscription
components/mobile-drawer.tsx       # Mobile nav
components/momentum-badge.tsx      # Momentum badge
components/pro-field-teaser.tsx    # Pro tier teaser
components/user-menu.tsx           # User dropdown menu

# Landing sections to delete (not useful for buildlog)
components/landing/pipeline-scroll.tsx  # ScoutAgent-specific L1/L2/L3 visual
components/landing/pricing.tsx          # Pricing table (buildlog is free)

# Root config files
vitest.config.ts       # Test config
playwright.config.ts   # E2E test config
proxy.ts               # Dev proxy
.env.local             # Old env vars (create fresh if needed)
.env.example           # Old env example

# Documentation (rewrite from scratch)
README.md              # Old readme
CHANGELOG.md           # Old changelog (if exists)
ROADMAP.md             # Old roadmap (if exists)
CONTRIBUTING.md        # Old contributing (if exists)
CODE_OF_CONDUCT.md     # Old code of conduct (if exists)
SECURITY.md            # Old security policy (if exists)
CLAUDE.md              # Old project instructions (rewrite for buildlog)
```

### Files to keep but NOT touch:
```
next-env.d.ts          # Auto-generated by Next.js (regenerates on dev)
.mcp.json              # Claude Code MCP config (review, keep if useful)
.gitignore             # Keep (already has node_modules, .next, etc.)
```

### Files that need content modification (not deletion):
- `app/layout.tsx` — remove Appwrite auth import, update metadata for buildlog
- `app/page.tsx` — remove `getLoggedInUser()` redirect, rewrite for buildlog landing
- `next.config.ts` — remove `*.appwrite.cloud`, `api.stripe.com`, `js.stripe.com`, `hooks.stripe.com` from CSP
- `package.json` — strip old deps, update name/description/repo

---

## 10. Design system reference (carried over)

The full design system is in `DESIGN_SYSTEM.md`. Key points:

### Color palette (dark theme always on)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0A` | Page background |
| `surface` | `#151515` | Cards, sections |
| `surface-elevated` | `#1A1A1A` | Hover states |
| `surface-glass` | `rgba(255,255,255,0.03)` | Frosted glass |
| `border` | `#222222` | Default borders |
| `text` | `#F5F5F0` | Primary text (warm off-white) |
| `text-muted` | `#8A9EA0` | Secondary text |
| `text-dim` | `#525252` | Labels, dividers |
| `accent-green` | `#00E5B3` | Primary CTA |
| `accent-orange` | `#FF6B35` | Urgency |
| `accent-red` | `#FF3366` | Errors |
| `accent-amber` | `#FFB800` | Warnings |
| `accent-blue` | `#00AAFF` | Info, links |

### Typography (4-font hierarchy)
| Role | Font | Variable | Usage |
|------|------|----------|-------|
| Display | Space Grotesk | `--font-display` | Headlines |
| Body | IBM Plex Serif | `--font-serif` | Paragraphs |
| Data/Mono | JetBrains Mono | `--font-mono` | Labels, code, stats |
| UI | Inter | `--font-sans` | Buttons, nav |

### Motion presets (lib/motion.ts)
- `fadeInUp` — simple fade + slide
- `staggerContainer` / `staggerItem` — list animation
- `viewportFadeIn(delay)` — scroll-triggered
- `clipRevealStagger` / `clipRevealItem` — premium section reveals
- `scanLine` — horizontal wipe effect
- Never inline raw Framer Motion objects. Always use presets.

### Section pattern
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
</section>
```

### Textures
- `texture-graph` — 40px grid lines
- `texture-paper` — horizontal scan lines
- `texture-noise` — fractal noise grain

### Glass morphism
```
bg-surface-glass backdrop-blur-xl border border-border
```

---

## 11. Landing page plan for buildlog

### Voice & messaging
- **Audience:** Indie hackers, solo founders, AI-native builders who use Claude Code
- **Tone:** Developer-friendly, slightly irreverent, honest. "Finally, your AI sessions tell a story."
- **Core message:** Your build story disappears between Claude Code sessions. buildlog recovers it.

### Landing page sections (rewrite from scout-agent templates)

1. **Hero** (from intelligence-briefing.tsx)
   - Headline: "Your build story, recovered." or "git log for your AI coding sessions"
   - Subhead: "buildlog reads your Claude Code transcripts and generates a build journal — ready to post on X or LinkedIn."
   - CTA: `npx buildlog` (copy-to-clipboard)
   - Show a terminal mockup with sample output

2. **Problem** (from problem-agitation.tsx)
   - "50 Claude Code sessions later, where's the story?"
   - Show the pain: sessions disappear, no narrative, "build in public" but nothing to post
   - Before/after: chaos of .jsonl files vs clean BUILDLOG.md

3. **Demo/Output** (from alpha-cards-showcase.tsx)
   - Show real BUILDLOG.md output (use ScoutAgent's own story)
   - Show tweet thread output
   - Show LinkedIn post output
   - Tab between formats

4. **How it works** (3 steps)
   - Step 1: Run `npx buildlog` in your project
   - Step 2: It auto-detects your Claude Code transcripts
   - Step 3: Get your build journal + social posts

5. **Features grid**
   - Zero dependencies
   - No API keys needed
   - Auto-detects your project
   - 4 output formats (md, tweet, linkedin, json)
   - Works offline
   - Open source (MIT)

6. **Social proof / why this exists**
   - "Built from the ashes of a failed SaaS" — honest story
   - "ScoutAgent had 45 coding sessions. The story almost disappeared."
   - Link to ScoutAgent's own BUILDLOG.md as the showcase

7. **Final CTA**
   - `npx buildlog` with copy button
   - GitHub stars badge
   - "Free, open source, forever"

8. **Footer** — GitHub, npm, Twitter, MIT license

---

## 12. Launch plan

1. **Show HN:** "Show HN: buildlog — git log for your AI coding sessions"
2. **Reddit:** r/ClaudeAI, r/ChatGPTPro, r/programming
3. **Twitter/X:** Screenshot of real BUILDLOG.md + tweet thread output
4. **Dev.to/Hashnode:** "I built a tool that turns Claude Code sessions into a build journal"
5. **Use ScoutAgent's own story as the example** — honest, includes the pivot, makes it relatable

---

## 13. Step-by-step build order

### Phase 1: Clean the duplicated project

**Goal:** Start from a working Next.js app that renders a blank landing page with the design system intact. Zero errors, zero dead imports.

**Step 1 — Fresh git**
```bash
rm -rf .git && git init
```

**Step 2 — Delete directories** (run from project root)
```bash
rm -rf lib/appwrite lib/refinery lib/stripe lib/ingest lib/auth schemas types hooks scripts e2e __fixtures__ memory
rm -rf app/\(auth\) app/\(dashboard\) app/api components/settings
```

**Step 3 — Delete individual files** (glob patterns)
```bash
rm -f lib/ai.ts lib/ai.test.ts lib/fetcher.ts lib/rate-limit.ts lib/rate-limit.test.ts
rm -f components/alpha-* components/dashboard-* components/sidebar-* components/saved-* components/pulse-* components/bookmark-* components/upgrade-* components/oauth-* components/auth-shell* components/blur-gate* components/inline-*
rm -f components/breadcrumbs.tsx components/card-skeleton.tsx components/change-password-form.tsx components/copy-link-button.tsx components/delete-account-button.tsx components/manage-subscription-button.tsx components/mobile-drawer.tsx components/momentum-badge.tsx components/pro-field-teaser.tsx components/user-menu.tsx
rm -f components/landing/pipeline-scroll.tsx components/landing/pricing.tsx
rm -f vitest.config.ts playwright.config.ts proxy.ts .env.local .env.example
rm -f README.md CHANGELOG.md ROADMAP.md CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md
```

**Step 4 — Strip package.json**
Remove all deps except: next, react, react-dom, tailwindcss, @tailwindcss/postcss, postcss, tailwind-merge, clsx, framer-motion, lucide-react, typescript, @types/node, @types/react, @types/react-dom.
Remove ALL devDependencies (vitest, playwright, testing-library, etc.).
Update name to "buildlog", update description, remove old repo URL.

**Step 5 — Clean app/layout.tsx**
Remove the Appwrite `getLoggedInUser` import and redirect. Update metadata (title, description, OG tags) for buildlog. Keep fonts, ToastProvider, dark class.

**Step 6 — Clean app/page.tsx**
Replace entirely with a simple placeholder landing page. Remove all scout-agent landing component imports. Just render "buildlog — coming soon" with the design system fonts/colors.

**Step 7 — Clean next.config.ts**
Remove `*.appwrite.cloud`, `api.stripe.com`, `js.stripe.com`, `hooks.stripe.com` from CSP. Keep security headers.

**Step 8 — Verify**
```bash
pnpm install && pnpm dev
```
Should compile and render the placeholder page with zero errors.

**Step 9 — Write new CLAUDE.md**
Create a fresh CLAUDE.md describing the buildlog project. Reference this handoff doc for specs.

**Step 10 — Initial commit**
```bash
git add -A && git commit -m "chore: clean slate from scout-agent template"
```

### Phase 2: Build the CLI tool

**Important:** The CLI lives in `src/` and compiles to `dist/`. The Next.js landing page lives in `app/`. They coexist but are separate build targets.

1. Create `src/` directory: `cli.ts`, `parser.ts`, `extractor.ts`, `formatter.ts`, `types.ts`
2. Create `tsconfig.cli.json` — separate from the Next.js tsconfig. Target: ES2022, module: NodeNext, outDir: dist/, rootDir: src/. Do NOT use the existing tsconfig.json (it has Next.js plugins and JSX config the CLI doesn't need).
3. Build `types.ts` — define Session, Moment, BuildLog types
4. Build `parser.ts` — read .jsonl files line by line (readline), group events by sessionId, filter to user/assistant types only
5. Build `extractor.ts` — apply heuristic regexes to classify moments (DECISION, PIVOT, EMOTION, DIRECTIVE, QUESTION)
6. Build `formatter.ts` — implement all 4 output formats (md, json, tweet, linkedin)
7. Build `cli.ts` — arg parsing (manual, no libraries), auto-detect project path, orchestration. Add `#!/usr/bin/env node` shebang.
8. Add to package.json: `"bin": { "buildlog": "./dist/cli.js" }`, `"files": ["dist"]`, build script: `"build:cli": "tsc -p tsconfig.cli.json"`
9. Test against ScoutAgent's own transcripts (copy the `.claude/projects/-Users-leonardojaques-projects-personal-scout-agent/` directory or point to it)
10. Verify `npx .` works locally

### Phase 3: Build the landing page
1. Rewrite `components/logo.tsx` for buildlog branding
2. Rewrite hero section (terminal mockup with sample output)
3. Rewrite problem section
4. Build output demo section (tabbed: md / tweet / linkedin)
5. Build "how it works" 3-step section
6. Build features grid
7. Rewrite social proof / origin story section
8. Rewrite final CTA (npx buildlog + GitHub link)
9. Rewrite footer
10. Update `app/robots.ts` and `app/sitemap.ts`

### Phase 4: Publish
1. Publish CLI to npm (`npm publish`)
2. Deploy landing page to Vercel
3. Execute launch plan (Show HN, Reddit, Twitter)

---

## 14. v2 ideas (NOT for v1)

- AI-powered session summaries (use Claude to summarize each session instead of heuristics)
- Thread format output (pre-formatted Twitter thread with numbering)
- Blog post outline output
- Interactive HTML timeline
- Diff view (what changed between sessions)
- Token cost tracking (from `usage` data in assistant messages)
- Multi-project dashboard
- GitHub Action (auto-generate buildlog on push)

---

## Appendix: Code style conventions (carry over)

- File names: `kebab-case.ts`. Components: `PascalCase`. Functions/variables: `camelCase`.
- Imports use `@/` path alias for Next.js code. CLI code in `src/` uses relative imports.
- Use `import type` for type-only imports.
- Server components by default. `"use client"` only when needed.
- Named exports (except page components which use default).
- Use design tokens from `globals.css` — never hardcode hex colors.
- Use `cn()` from `@/lib/utils` for Tailwind class merging.
- Motion presets from `lib/motion.ts` — never inline raw Framer Motion objects.
- Icons from `lucide-react` only.
- Dark theme is always on (`class="dark"` on `<html>`).
- Don't read file contents from this appendix — read the actual files after cleanup. They'll still be there.
