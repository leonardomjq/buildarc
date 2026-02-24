# Security Policy

## How buildarc handles your data

buildarc runs entirely on your machine. No data is transmitted to any server, no telemetry is collected, and no accounts are required.

- Transcripts are read from your local `.claude/` directory
- Extraction output is written to `.buildarc/` in your project root
- The AI storytelling step (if used) pipes data to your locally installed `claude` CLI — buildarc never calls any API directly

Your session data never leaves your machine through buildarc.

## What the scrubber catches

Before any extracted text reaches shareable content, buildarc's scrubber (`src/scrubber.ts`) runs regex-based detection and replaces matches with `[REDACTED]`.

**Detected patterns:**

| Category | Examples |
|----------|----------|
| OpenAI API keys | `sk-...` prefixed tokens |
| GitHub tokens | `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` prefixed tokens |
| Bearer tokens | `Bearer <token>` patterns |
| Connection strings | PostgreSQL, MongoDB, MySQL, Redis, AMQP URIs |
| Environment secrets | `DATABASE_URL=`, `API_KEY=`, `SECRET_KEY=`, `JWT_SECRET=`, `OPENAI_API_KEY=`, `ANTHROPIC_API_KEY=`, `GITHUB_TOKEN=`, and 20+ other common env variable names |
| Generic secrets | Assignments to `token`, `api_key`, `secret`, `password`, `credentials` variables |

All matches are replaced visibly with `[REDACTED]` — never silently removed.

## What it doesn't catch

The scrubber uses regex heuristics. It may miss:

- Custom-format API keys without known prefixes
- Secrets embedded in URLs without a recognized scheme
- Passwords that don't follow common assignment patterns
- Proprietary token formats specific to less common services

**Always review your output before sharing publicly.** The scrubber is a safety net, not a guarantee.

## Reporting a vulnerability

If you discover a security vulnerability — especially a scrubber bypass that leaks secrets into shareable content — please report it through [GitHub's private vulnerability reporting](https://github.com/leonardomjq/buildarc/security/advisories/new).

- **Do not** open a public issue for security vulnerabilities
- You'll receive an acknowledgment within 48 hours
- Scrubber bypasses are treated as critical priority

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
