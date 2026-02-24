# Roadmap

This is a living document. Priorities shift as usage patterns emerge.

## Now (v0.x)

What's shipped and being hardened:

- Two-layer pipeline: instant heuristic extraction + AI storytelling via `claude` CLI
- Three content formats: tweet thread (narrative + shitpost), LinkedIn post, build journal
- Secret scrubber with known-prefix detection
- Extraction caching for fast re-runs
- Auto-detect project from working directory

## Next

What's being explored:

- **More content styles** — hot take, stats flex, changelog-to-thread
- **Richer extraction** — tool usage patterns, session duration, code-change density
- **Better scrubber coverage** — more token formats, configurable patterns
- **Output quality iteration** — prompt tuning based on real-world generated content

## Later

Ideas that make sense but aren't urgent:

- **Multi-project summaries** — aggregate across repos for "weekly build update" posts
- **Custom prompt templates** — bring your own voice/style
- **Other transcript formats** — Cursor, Windsurf, Copilot (if their formats are accessible)
- **Web viewer** — browse your BUILDARC.md in a local UI

## Not planned

Things buildarc intentionally won't do:

- **Accounts or cloud services** — buildarc is a CLI. Your data stays local.
- **Telemetry or analytics** — no tracking, no phone-home, no usage data collection.
- **Paid features or premium tiers** — free forever, MIT license.
- **Real-time monitoring** — buildarc is retrospective, not a daemon.
- **Blog post generation** — buildarc extracts moments and generates social content. It doesn't ghost-write long-form articles.
