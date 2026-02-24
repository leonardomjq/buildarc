# buildarc

Your build story, recovered.

buildarc reads your [Claude Code](https://claude.ai/code) conversation transcripts and turns them into shareable content — tweet threads, LinkedIn posts, build journals. One command, zero config.

```bash
npx buildarc
```

## What it does

You build things with Claude Code. Those sessions contain decisions, pivots, breakthroughs, and dead ends — a story. buildarc finds that story and helps you share it.

```
  buildarc v0.1.0

  Reading your Claude Code sessions...
  Found 14 sessions | 47 moments | 12 decisions, 3 pivots

  Build summary saved to .buildarc/BUILDARC.md

  What do you want to share?

    1. Tweet thread
    2. LinkedIn post
    3. Build journal
    4. All of the above
    5. Just the summary
```

## How it works

1. **Parse** — Streams your `.jsonl` transcript files, filters to the meaningful messages
2. **Extract** — Classifies key moments: decisions, pivots, emotions, directives, questions
3. **Scrub** — Redacts API keys, tokens, and secrets before anything becomes shareable
4. **Format** — Writes a structured build summary (Markdown or JSON)
5. **Story** — Sends the summary to Claude to write your post in your voice
6. **Ship** — Saves the content to `.buildarc/` — copy, paste, done

Zero runtime dependencies. Your data stays local. The AI step uses your existing Claude Code installation.

## Install

```bash
# Run directly (recommended)
npx buildarc

# Or install globally
npm install -g buildarc
```

## Usage

```bash
# Auto-detect project from current directory
buildarc

# Generate a tweet thread (skip the menu)
buildarc --tweet

# Shitpost-style tweet
buildarc --tweet --style shitpost

# Generate everything at once
buildarc --tweet --linkedin --journal

# Extraction only, no AI
buildarc --no-ai

# Last 5 sessions, JSON output
buildarc --sessions 5 --format json

# Explicit project path
buildarc ~/.claude/projects/-Users-you-projects-my-app/
```

## Flags

```
--format <md|json>   Output format (default: md)
--since <DATE>       Only sessions after this date (YYYY-MM-DD)
--sessions <N>       Last N sessions only
--output, -o <DIR>   Output directory (default: .buildarc/)
--no-ai              Extraction only, skip content generation
--tweet              Generate X/Twitter thread
--linkedin           Generate LinkedIn post
--journal            Generate build journal
--style <name>       Content style variant (e.g. narrative, shitpost)
-q, --quiet          Minimal output
-h, --help           Show help
-v, --version        Show version
```

Flags are combinable: `buildarc --tweet --linkedin` generates both without the interactive menu.

## Requirements

- **Node.js** >= 18
- **Claude Code** — buildarc piggybacks on your existing Claude installation for the AI storytelling step. Without it, you still get the extraction summary. [Install Claude Code](https://claude.ai/code)

## What gets redacted

buildarc automatically scrubs secrets from your extracted moments before they reach shareable content:

- API keys (OpenAI, Stripe, GitHub, AWS, Slack)
- Bearer tokens
- Connection strings (Postgres, MongoDB, Redis, etc.)
- Environment variable secrets (`DATABASE_URL=...`, `API_KEY=...`, etc.)

Matches are replaced with `[REDACTED]` — visible, not silent.

## Output

Everything goes to `.buildarc/` in your project root:

- `BUILDARC.md` — Structured build summary with all moments, grouped by date
- `tweet.md` — Ready-to-paste tweet thread
- `linkedin.md` — Ready-to-paste LinkedIn post
- `journal.md` — Build journal entry

## License

MIT
