# Releasing buildarc

Step-by-step runbook for publishing a new version to npm.

## Pre-flight checks

```bash
# 1. Make sure you're on main with a clean tree
git status

# 2. Types compile
pnpm typecheck

# 3. CLI builds
pnpm build:cli

# 4. CLI runs and shows correct version
node dist/cli.js --version

# 5. Check what npm will actually publish
npm pack --dry-run
# Should only list dist/ files + package.json + README + LICENSE + CHANGELOG
```

## Decide the version bump

This project follows [Semantic Versioning](https://semver.org/). While on `0.x.x`:

| Change | Bump | Example |
|--------|------|---------|
| Bug fix, typo, small correction | **patch** `0.1.0 → 0.1.1` | Fix extraction regex false positive |
| New flag, new content format, new feature | **minor** `0.1.0 → 0.2.0` | Add `--bluesky` output format |
| Breaking change to CLI args or output format | **major** `0.x → 1.0` | Rename `--tweet` to `--x` |

Stay on `0.x.x` until the CLI is stable and proven in the wild.

## Release

One command does everything:

```bash
# Bug fix
pnpm release:patch

# New feature
pnpm release:minor

# Breaking change (rare — discuss first)
pnpm release:major
```

This runs: `npm version <type>` → `git push` → `git push --tags` → `npm publish`.

The `prepublishOnly` script automatically rebuilds `dist/` before publishing.

## After release

1. **Update CHANGELOG.md** — move items from an "Unreleased" section (if any) under the new version heading
2. **Create a GitHub Release** from the new tag:
   ```bash
   gh release create v$(node -p "require('./package.json').version") --generate-notes
   ```
3. **Verify on npm:**
   ```bash
   npm info buildarc version
   ```

## Common mistakes

| Mistake | Prevention |
|---------|------------|
| Publishing stale `dist/` | `prepublishOnly` rebuilds automatically |
| Forgetting to push tags | `release:*` scripts push tags in the same command |
| Version in code drifts from package.json | Version is read from `package.json` at runtime — no hardcoded string |
| Publishing `.env` or secrets | `"files": ["dist"]` in package.json is an allowlist — only `dist/` ships |
| Publishing from wrong branch | Always release from `main` — check `git branch` first |

## Manual release (if scripts fail)

```bash
npm version patch          # bumps package.json, creates git tag
git push && git push --tags
npm publish
```
