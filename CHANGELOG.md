# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
