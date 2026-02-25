# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-02-25

### Added

- Improved generation wait UX with updated demo GIF

### Fixed

- Biome formatting for StickyCta dynamic import
- Vercel React best practices applied to landing page
- Resolved all Biome lint warnings
- Auto-format `package.json` on version bump

## [0.2.1] - 2026-02-25

### Fixed

- Remove `./` prefix from bin path for npm 11 compatibility

## [0.2.0] - 2026-02-25

### Added

- Thread-format tweets — generates multi-tweet threads instead of a single post
- Project context injection — reads `package.json` and git remote for CTAs and specifics
- CLI UX upgrade — rotating spinners, block header, parallel content generation
- CLI visual polish — editorial terminal UX

### Changed

- README reordered for emotional impact — sells first, documents second

### Fixed

- README cleanup — resolved inconsistencies and reduced redundancy

## [0.1.1] - 2026-02-24

### Added

- Secret scrubber — redacts API keys, tokens, connection strings, and env secrets from extracted text before it reaches shareable content
- Test suite (vitest) — scrubber, extractor, parser, and formatter coverage
- Biome linter/formatter — enforces consistent code style
- README.md — public-facing docs for GitHub and npm
- CONTRIBUTING.md — contributor guide with setup, architecture, and code style
- GitHub CI workflow — typecheck, lint, test, and build on push/PR
- GitHub issue templates — bug reports and feature requests

### Changed

- Extraction cache now uses source file mtime comparison instead of a 5-minute time heuristic
- Parser returns skip statistics (skipped lines, total lines, files skipped)
- CLI warns when transcript parse skip rate exceeds 10%
- Storyteller rejects empty output instead of resolving with an empty string

### Fixed

- Flag conflict detection: `--no-ai` + content flags (`--tweet`, `--linkedin`, `--journal`) now errors early with a clear message
- Flag conflict detection: `--no-ai` + `--style` now errors early

## [0.1.0] - 2026-02-24

### Added

- CLI entry point with arg parsing and interactive menu
- JSONL transcript parser — streams Claude Code session files, groups into sessions
- Regex-based extractor — classifies moments (DECISION, PIVOT, EMOTION, DIRECTIVE, QUESTION)
- Markdown and JSON output formatters for extraction data
- Storytelling layer — spawns `claude` CLI to generate tweet threads, LinkedIn posts, and build journals
- Prompt templates for tweet (narrative + shitpost styles), LinkedIn, and journal formats
- Auto-detect project from current working directory
- Extraction caching — skips re-parse on re-runs when BUILDARC.md is fresh
- `--tweet`, `--linkedin`, `--journal` flags for direct content generation (skip menu)
- `--since`, `--sessions` filters for scoping extraction
- `--no-ai` flag for extraction-only mode
- `--style` flag for content style variants
- Graceful fallback when `claude` CLI is not installed
