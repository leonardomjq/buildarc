#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { extractBuildLog } from "./extractor.js";
import { formatJson, formatMarkdown } from "./formatter.js";
import { parseProject } from "./parser.js";
import { STYLE_OPTIONS } from "./prompts.js";
import { generateContent, isClaudeAvailable } from "./storyteller.js";
import type { CliOptions, ContentFormat, OutputFormat, ProjectContext } from "./types.js";

// ── Version ─────────────────────────────────────────────────────────

const VERSION = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
).version;

// ── ANSI colors (respects NO_COLOR: https://no-color.org/) ──────────

const noColor = "NO_COLOR" in process.env || process.env.TERM === "dumb" || !process.stderr.isTTY;

const dim = noColor ? (s: string) => s : (s: string) => `\x1b[2m${s}\x1b[22m`;
const bold = noColor ? (s: string) => s : (s: string) => `\x1b[1m${s}\x1b[22m`;
const green = noColor ? (s: string) => s : (s: string) => `\x1b[32m${s}\x1b[39m`;
const cyan = noColor ? (s: string) => s : (s: string) => `\x1b[36m${s}\x1b[39m`;
const yellow = noColor ? (s: string) => s : (s: string) => `\x1b[33m${s}\x1b[39m`;
const red = noColor ? (s: string) => s : (s: string) => `\x1b[31m${s}\x1b[39m`;

// ── Layout helpers ──────────────────────────────────────────────────

function stripAnsi(s: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ANSI escape matching
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function rightAlign(left: string, right: string, width = 72): string {
  const visibleLeft = stripAnsi(left).length;
  const visibleRight = stripAnsi(right).length;
  const gap = Math.max(1, width - visibleLeft - visibleRight);
  return left + " ".repeat(gap) + right;
}

function rule(): string {
  return dim("\u2500".repeat(16));
}

// ── Logging (stderr so content goes to files cleanly) ───────────────

function log(msg: string) {
  process.stderr.write(`${msg}\n`);
}

// ── Arg parsing ─────────────────────────────────────────────────────

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    projectPath: null,
    format: "md",
    since: null,
    sessions: null,
    output: null,
    quiet: false,
    noAi: false,
    contentFormats: [],
    style: null,
    help: false,
    version: false,
  };

  const args = argv.slice(2); // skip node + script
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "-v":
      case "--version":
        opts.version = true;
        break;
      case "-q":
      case "--quiet":
        opts.quiet = true;
        break;
      case "--no-ai":
        opts.noAi = true;
        break;
      case "--tweet":
        opts.contentFormats.push("tweet");
        break;
      case "--linkedin":
        opts.contentFormats.push("linkedin");
        break;
      case "--journal":
        opts.contentFormats.push("journal");
        break;
      case "--style": {
        if (i + 1 >= args.length) {
          log(red("--style requires a style name."));
          process.exit(1);
        }
        opts.style = args[++i];
        break;
      }
      case "--format": {
        if (i + 1 >= args.length) {
          log(red('--format requires a value ("md" or "json").'));
          process.exit(1);
        }
        const val = args[++i];
        if (val === "md" || val === "json") {
          opts.format = val as OutputFormat;
        } else {
          log(red(`Invalid format: ${val}. Use "md" or "json".`));
          process.exit(1);
        }
        break;
      }
      case "--since": {
        if (i + 1 >= args.length) {
          log(red("--since requires a date (YYYY-MM-DD)."));
          process.exit(1);
        }
        const dateStr = args[++i];
        if (Number.isNaN(new Date(dateStr).getTime())) {
          log(red(`Invalid date: ${dateStr}. Use YYYY-MM-DD format.`));
          process.exit(1);
        }
        opts.since = dateStr;
        break;
      }
      case "--sessions": {
        if (i + 1 >= args.length) {
          log(red("--sessions requires a number."));
          process.exit(1);
        }
        const n = Number.parseInt(args[++i], 10);
        if (Number.isNaN(n) || n <= 0) {
          log(red("--sessions must be a positive number."));
          process.exit(1);
        }
        opts.sessions = n;
        break;
      }
      case "--output":
      case "-o": {
        if (i + 1 >= args.length) {
          log(red("--output requires a file path."));
          process.exit(1);
        }
        opts.output = args[++i];
        break;
      }
      default:
        if (arg.startsWith("-")) {
          log(red(`Unknown option: ${arg}`));
          log(dim("Run with --help for usage info."));
          process.exit(1);
        }
        // Positional = project path
        opts.projectPath = arg;
    }

    i++;
  }

  return opts;
}

// ── Auto-detect project ─────────────────────────────────────────────

function autoDetectProject(): string | null {
  const cwd = process.cwd();
  // Claude projects dir uses encoded path: /Users/foo/bar → -Users-foo-bar
  const encoded = cwd.replace(/\//g, "-");
  const claudeDir = join(homedir(), ".claude", "projects", encoded);

  try {
    statSync(claudeDir);
    return claudeDir;
  } catch {
    return null;
  }
}

// ── Project context gathering ────────────────────────────────────────

function normalizeRepoUrl(raw: string): string {
  let url = raw.trim();
  // Strip git+ prefix
  url = url.replace(/^git\+/, "");
  // Strip trailing .git
  url = url.replace(/\.git$/, "");
  // Convert SSH to HTTPS: git@github.com:user/repo → https://github.com/user/repo
  url = url.replace(/^git@([^:]+):(.+)$/, "https://$1/$2");
  return url;
}

function gatherProjectContext(): ProjectContext {
  const ctx: ProjectContext = {
    name: null,
    description: null,
    repoUrl: null,
    homepageUrl: null,
    installCommand: null,
  };

  // Try package.json in cwd
  const pkgPath = join(process.cwd(), "package.json");
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    if (typeof pkg.name === "string") ctx.name = pkg.name;
    if (typeof pkg.description === "string") ctx.description = pkg.description;
    if (typeof pkg.homepage === "string") ctx.homepageUrl = pkg.homepage;

    // Repository field — string or { url: string }
    if (typeof pkg.repository === "string") {
      ctx.repoUrl = normalizeRepoUrl(pkg.repository);
    } else if (pkg.repository?.url) {
      ctx.repoUrl = normalizeRepoUrl(pkg.repository.url);
    }

    // Derive install command from bin field
    if (pkg.bin && ctx.name) {
      ctx.installCommand = `npx ${ctx.name}`;
    }
  } catch {
    // No package.json or invalid — that's fine
  }

  // Fallback: git remote for repo URL
  if (!ctx.repoUrl) {
    try {
      const remote = execSync("git remote get-url origin", {
        encoding: "utf-8",
        timeout: 3000,
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
      if (remote) ctx.repoUrl = normalizeRepoUrl(remote);
    } catch {
      // Not a git repo or no remote — that's fine
    }
  }

  return ctx;
}

// ── Arrow-key menu ─────────────────────────────────────────────────

interface MenuItem {
  label: string;
  value: string | null;
}

async function showArrowMenu(title: string, items: MenuItem[]): Promise<string | null> {
  let selected = 0;

  function render(clear = false) {
    if (clear) {
      // Move cursor up past the items + title + blank lines, then clear
      process.stderr.write(`\x1b[${items.length + 3}A`);
    }
    process.stderr.write("\x1b[J"); // clear from cursor to end
    log("");
    log(bold(`  ${title}`));
    log("");
    for (let i = 0; i < items.length; i++) {
      const pointer = i === selected ? cyan("❯") : " ";
      const label = i === selected ? bold(items[i].label) : items[i].label;
      log(`  ${pointer} ${label}`);
    }
  }

  render();

  return new Promise((resolve) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();

    function cleanup() {
      stdin.setRawMode(wasRaw ?? false);
      stdin.removeListener("data", onKey);
      stdin.pause();
    }

    function onKey(data: Buffer) {
      const key = data.toString();

      // Ctrl+C / Ctrl+D
      if (key === "\x03" || key === "\x04") {
        cleanup();
        log("");
        resolve(null);
        return;
      }

      // Enter
      if (key === "\r" || key === "\n") {
        cleanup();
        log("");
        resolve(items[selected].value);
        return;
      }

      // Arrow up / k
      if (key === "\x1b[A" || key === "k") {
        selected = (selected - 1 + items.length) % items.length;
        render(true);
        return;
      }

      // Arrow down / j
      if (key === "\x1b[B" || key === "j") {
        selected = (selected + 1) % items.length;
        render(true);
        return;
      }

      // Number keys for quick select
      const num = Number.parseInt(key, 10);
      if (num >= 1 && num <= items.length) {
        selected = num - 1;
        cleanup();
        log("");
        resolve(items[selected].value);
        return;
      }
    }

    stdin.on("data", onKey);
  });
}

async function showMenu(): Promise<string | null> {
  return showArrowMenu("What do you want to share?", [
    { label: "X thread", value: "tweet" },
    { label: "LinkedIn post", value: "linkedin" },
    { label: "Build journal", value: "journal" },
    { label: "All of the above", value: "all" },
    { label: "Just the summary", value: null },
  ]);
}

// ── Style sub-menu ──────────────────────────────────────────────────

const STYLE_LABELS: Record<string, string> = {
  thread: "Thread (build story, 3-5 tweets)",
  narrative: "Narrative (single literary post)",
  shitpost: "Shitpost (absurdist daylog)",
};

async function showStyleMenu(format: ContentFormat): Promise<string | null> {
  const styles = STYLE_OPTIONS[format];
  if (!styles || styles.length <= 1) return null;

  const items = styles.map((s) => ({
    label: STYLE_LABELS[s] ?? s,
    value: s,
  }));

  return showArrowMenu("What vibe?", items);
}

// ── Help text ───────────────────────────────────────────────────────

function showHelp() {
  log(`
${bold("buildarc")} ${dim(`v${VERSION}`)}

  Your build story, recovered.

${bold("REQUIRES")}

  Claude Code (https://claude.ai/code)
  buildarc turns your Claude Code sessions into shareable content.
  No API keys, no config — it piggybacks on your existing Claude setup.

${bold("USAGE")}

  buildarc [project-path] [options]

${bold("ARGUMENTS")}

  project-path    Path to Claude project directory (auto-detected if omitted)
                  Example: ~/.claude/projects/-Users-you-projects-my-app/

${bold("OPTIONS")}

  --format <md|json>   Output format (default: md)
  --since <DATE>       Only include sessions after this date (YYYY-MM-DD)
  --sessions <N>       Only include the last N sessions
  --output, -o <DIR>   Output directory (default: .buildarc/)
  --no-ai              Skip AI content generation, extraction only
  --tweet              Generate X thread (skips menu)
  --linkedin           Generate LinkedIn post (skips menu)
  --journal            Generate build journal (skips menu)
  --style <name>       Content style variant (e.g. thread, narrative, shitpost)
  -q, --quiet          Minimal output
  -h, --help           Show this help
  -v, --version        Show version

${bold("EXAMPLES")}

  ${dim("# Auto-detect project from cwd")}
  buildarc

  ${dim("# Explicit project path")}
  buildarc ~/.claude/projects/-Users-you-projects-my-app/

  ${dim("# Last 10 sessions, JSON output")}
  buildarc --sessions 10 --format json

  ${dim("# Extraction only, no AI")}
  buildarc --no-ai

  ${dim("# Generate X thread directly (no menu)")}
  buildarc --tweet

  ${dim("# Shitpost-style X thread (absurdist daylog)")}
  buildarc --tweet --style shitpost

  ${dim("# Generate all content in one shot")}
  buildarc --tweet --linkedin --journal
`);
}

// ── Output directory ────────────────────────────────────────────────

const OUTPUT_DIR = ".buildarc";

const CONTENT_FILENAMES: Record<string, string> = {
  tweet: "tweet.md",
  linkedin: "linkedin.md",
  journal: "journal.md",
};

function ensureOutputDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function resolveContentPath(outputDir: string, format: string): string {
  return join(outputDir, CONTENT_FILENAMES[format]);
}

// ── Header ──────────────────────────────────────────────────────────

function showHeader(): void {
  log("");
  log(`  ${cyan("◆")} ${bold("BUILDARC")}  ${dim(`v${VERSION}`)}`);
  log(`    ${dim("Your build story, recovered.")}`);
  log(`  ${rule()}`);
  log("");
}

// ── Graceful shutdown ───────────────────────────────────────────────

function setupSignalHandlers() {
  const handler = () => {
    log("");
    process.exit(130); // 128 + SIGINT(2) — standard convention
  };
  process.on("SIGINT", handler);
  process.on("SIGTERM", handler);
}

// ── Extraction cache ────────────────────────────────────────────────

function extractionIsFresh(outputFile: string, projectPath: string): boolean {
  try {
    if (!existsSync(outputFile)) return false;
    if (!outputFile.endsWith(".md")) return false;
    const outputMtime = statSync(outputFile).mtimeMs;

    // Compare against the newest .jsonl in the project directory
    const entries = readdirSync(projectPath);
    let newestSource = 0;
    for (const entry of entries) {
      if (entry.endsWith(".jsonl")) {
        const mtime = statSync(join(projectPath, entry)).mtimeMs;
        if (mtime > newestSource) newestSource = mtime;
      }
    }

    // Fresh if extraction is newer than the newest source file
    return newestSource > 0 && outputMtime > newestSource;
  } catch {
    return false;
  }
}

// ── Content generation ──────────────────────────────────────────────

const CONTENT_LABELS: Record<string, string> = {
  tweet: "X thread",
  linkedin: "LinkedIn post",
  journal: "build journal",
};

const CONTENT_NUDGES: Record<string, string> = {
  tweet: "paste into X",
  linkedin: "paste into LinkedIn",
  journal: "publish or keep for yourself",
};

const FILE_COMMENTS: Record<string, string> = {
  tweet: "buildarc X thread — copy below, paste into X",
  linkedin: "buildarc LinkedIn post — copy below, paste into LinkedIn",
  journal: "buildarc build journal — publish as-is or edit to taste",
};

const PREVIEW_LINES = 6;
const BOX_INNER_WIDTH = 65;

// ── Spinner ────────────────────────────────────────────────────────

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const MESSAGE_INTERVAL_MS = 8000;

const SPINNER_MESSAGES: Record<string, string[]> = {
  tweet: [
    "Reading your moments...",
    "Finding the story arc...",
    "Crafting your thread...",
    "Finding the hook...",
    "Compressing weeks into tweets...",
    "Drafting, revising, polishing...",
    "Claude is a slow writer — hang tight...",
    "Still going — good threads take a minute...",
    "Refining the narrative...",
    "Almost there...",
  ],
  linkedin: [
    "Reading your moments...",
    "Finding the story arc...",
    "Structuring your insights...",
    "Writing for the feed...",
    "Polishing the narrative...",
    "Drafting, revising, polishing...",
    "Claude is a slow writer — hang tight...",
    "Still going — good posts take a minute...",
    "Refining the narrative...",
    "Almost there...",
  ],
  journal: [
    "Reading your moments...",
    "Finding the story arc...",
    "Weaving the narrative...",
    "Recovering the journey...",
    "Connecting the threads...",
    "Drafting, revising, polishing...",
    "Claude is a slow writer — hang tight...",
    "Still going — good journals take a minute...",
    "Refining the narrative...",
    "Almost there...",
  ],
  parallel: [
    "Writing all three at once...",
    "Thread, post, and journal in flight...",
    "Claude is multitasking...",
    "Drafting, revising, polishing...",
    "Claude is a slow writer — hang tight...",
    "Still going — this takes about a minute...",
    "Refining the narratives...",
    "Almost there...",
  ],
};

function startSpinner(messages: string | string[]): () => void {
  const msgList = typeof messages === "string" ? [messages] : messages;
  let i = 0;
  const t0 = Date.now();
  const interval = setInterval(() => {
    const frame = SPINNER_FRAMES[i % SPINNER_FRAMES.length];
    const elapsed = Math.round((Date.now() - t0) / 1000);
    const msgIndex = Math.min(
      Math.floor((Date.now() - t0) / MESSAGE_INTERVAL_MS),
      msgList.length - 1,
    );
    const left = `  ${cyan(frame)} ${dim(msgList[msgIndex])}`;
    const right = elapsed > 0 ? dim(`${elapsed}s`) : "";
    process.stderr.write(`\r\x1b[K${rightAlign(left, right)}`);
    i++;
  }, 80);

  return () => {
    clearInterval(interval);
    process.stderr.write("\r\x1b[K");
  };
}

function withFileComment(content: string, fmt: string): string {
  const comment = FILE_COMMENTS[fmt];
  if (!comment) return content;
  return `<!-- ${comment} -->\n\n${content}`;
}

function showPreview(content: string): void {
  const lines = content.trimStart().split("\n").slice(0, PREVIEW_LINES);
  const displayLines: string[] = [];

  for (const line of lines) {
    displayLines.push(
      line.length > BOX_INNER_WIDTH ? `${line.slice(0, BOX_INNER_WIDTH - 1)}\u2026` : line,
    );
  }

  const totalLines = content.trimStart().split("\n").length;
  if (totalLines > PREVIEW_LINES) {
    displayLines.push("\u2026");
  }

  log("");
  log(`  ${dim(`\u250c${"\u2500".repeat(BOX_INNER_WIDTH + 2)}\u2510`)}`);
  for (const line of displayLines) {
    const pad = " ".repeat(Math.max(0, BOX_INNER_WIDTH - line.length));
    log(`  ${dim("\u2502")} ${line}${pad} ${dim("\u2502")}`);
  }
  log(`  ${dim(`\u2514${"\u2500".repeat(BOX_INNER_WIDTH + 2)}\u2518`)}`);
}

function fallbackContent(fmt: string, reason: "no-claude" | "error", errorMsg?: string): string {
  const retryCmd = `npx buildarc --${fmt}`;
  const label = CONTENT_LABELS[fmt] ?? fmt;

  if (reason === "no-claude") {
    return [
      "# Almost there",
      "",
      "buildarc found your build story (check BUILDARC.md), but it needs",
      `Claude Code installed to write your ${label}.`,
      "",
      "1. Install Claude Code: https://claude.ai/code",
      `2. Come back and run: \`${retryCmd}\``,
      "",
      `It'll pick up where it left off.`,
      "",
    ].join("\n");
  }

  return [
    `# Couldn't write your ${label}`,
    "",
    `Something went wrong: ${errorMsg ?? "unknown error"}`,
    "",
    `Run \`${retryCmd}\` to try again — your build summary is cached,`,
    `so it'll go straight to writing.`,
    "",
  ].join("\n");
}

function resolveStyle(fmt: string, style: string | null, quiet: boolean): string {
  const defaultStyle = fmt === "tweet" ? "thread" : "narrative";
  const effectiveStyle = style ?? defaultStyle;
  const availableStyles = STYLE_OPTIONS[fmt] ?? ["narrative"];
  if (style && !availableStyles.includes(style) && !quiet) {
    log(yellow(`  Style "${style}" not available for ${fmt}, using ${defaultStyle}.`));
  }
  return availableStyles.includes(effectiveStyle) ? effectiveStyle : defaultStyle;
}

interface GenerationResult {
  fmt: ContentFormat;
  ok: boolean;
  content?: string;
  error?: string;
  elapsed: number;
}

async function generateSingle(
  fmt: ContentFormat,
  extraction: string,
  outDir: string,
  quiet: boolean,
  style: string | null,
  projectContext?: ProjectContext,
): Promise<GenerationResult> {
  const label = CONTENT_LABELS[fmt];
  let stopSpinner: (() => void) | null = null;
  const t0Gen = Date.now();

  if (!quiet) {
    log("");
    log(dim("  This usually takes 60–90 seconds — Claude is writing, not fetching."));
    log("");
    stopSpinner = startSpinner(SPINNER_MESSAGES[fmt] ?? [`Writing your ${label}...`]);
  }

  try {
    const resolvedStyle = resolveStyle(fmt, style, quiet);
    const result = await generateContent(extraction, fmt, resolvedStyle, projectContext);
    stopSpinner?.();
    const outFile = resolveContentPath(outDir, fmt);
    await writeFile(outFile, `${withFileComment(result, fmt)}\n`, "utf-8");
    const elapsed = (Date.now() - t0Gen) / 1000;
    if (!quiet) {
      log(rightAlign(`  ${green("\u2713")} ${bold(label)}`, dim(`${elapsed.toFixed(1)}s`)));
      showPreview(result);
      log(`  ${dim("\u2192")} ${outFile} \u2014 ${CONTENT_NUDGES[fmt]}`);
    }
    return { fmt, ok: true, content: result, elapsed };
  } catch (err) {
    stopSpinner?.();
    const msg = err instanceof Error ? err.message : String(err);
    const elapsed = (Date.now() - t0Gen) / 1000;
    if (!quiet) {
      log(
        rightAlign(`  ${red("\u2717")} ${bold(label)}  ${dim(msg)}`, dim(`${elapsed.toFixed(1)}s`)),
      );
    }
    const outFile = resolveContentPath(outDir, fmt);
    await writeFile(outFile, fallbackContent(fmt, "error", msg), "utf-8");
    if (!quiet) {
      log(dim(`  ${outFile}`));
    }
    return { fmt, ok: false, error: msg, elapsed };
  }
}

async function generateParallel(
  formats: readonly ContentFormat[],
  extraction: string,
  outDir: string,
  quiet: boolean,
  style: string | null,
  projectContext?: ProjectContext,
): Promise<GenerationResult[]> {
  // Warn about unavailable styles upfront
  for (const fmt of formats) {
    resolveStyle(fmt, style, quiet);
  }

  const t0 = Date.now();
  let stopSpinner: (() => void) | null = null;

  if (!quiet) {
    log("");
    log(dim("  This usually takes 60–90 seconds — Claude is writing, not fetching."));
    log("");
    stopSpinner = startSpinner(SPINNER_MESSAGES.parallel);
  }

  const promises = formats.map(async (fmt): Promise<GenerationResult> => {
    const t0Gen = Date.now();
    try {
      const resolvedStyle = resolveStyle(fmt, style, true); // quiet — spinner is unified
      const result = await generateContent(extraction, fmt, resolvedStyle, projectContext);
      const outFile = resolveContentPath(outDir, fmt);
      await writeFile(outFile, `${withFileComment(result, fmt)}\n`, "utf-8");
      return { fmt, ok: true, content: result, elapsed: (Date.now() - t0Gen) / 1000 };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const outFile = resolveContentPath(outDir, fmt);
      await writeFile(outFile, fallbackContent(fmt, "error", msg), "utf-8");
      return { fmt, ok: false, error: msg, elapsed: (Date.now() - t0Gen) / 1000 };
    }
  });

  const results = await Promise.allSettled(promises);
  stopSpinner?.();

  const totalElapsed = (Date.now() - t0) / 1000;
  const resolved: GenerationResult[] = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { fmt: "tweet" as ContentFormat, ok: false, error: "unexpected failure", elapsed: 0 },
  );

  if (!quiet) {
    // Print results in original format order
    for (const res of resolved) {
      const label = CONTENT_LABELS[res.fmt];
      if (res.ok) {
        log(rightAlign(`  ${green("\u2713")} ${bold(label)}`, dim(`${res.elapsed.toFixed(1)}s`)));
        if (res.content) showPreview(res.content);
        const outFile = resolveContentPath(outDir, res.fmt);
        log(`  ${dim("\u2192")} ${outFile} \u2014 ${CONTENT_NUDGES[res.fmt]}`);
      } else {
        log(
          rightAlign(
            `  ${red("\u2717")} ${bold(label)}  ${dim(res.error ?? "unknown")}`,
            dim(`${res.elapsed.toFixed(1)}s`),
          ),
        );
        const outFile = resolveContentPath(outDir, res.fmt);
        log(dim(`  ${outFile}`));
      }
    }

    const succeeded = resolved.filter((r) => r.ok);
    if (succeeded.length >= 2) {
      log("");
      log(`  ${rule()}`);
      log("");
      log(
        rightAlign(
          `  Done. ${bold(String(succeeded.length))} files in ${dim(`${outDir}/`)}`,
          dim(`${totalElapsed.toFixed(1)}s total`),
        ),
      );
      log("");
      for (const res of succeeded) {
        const filename = CONTENT_FILENAMES[res.fmt];
        const nudge = CONTENT_NUDGES[res.fmt];
        log(`    ${filename.padEnd(15)}${dim(nudge)}`);
      }
    }
  }

  return resolved;
}

async function runContentGeneration(
  formats: readonly ContentFormat[],
  extraction: string,
  outDir: string,
  quiet: boolean,
  style: string | null,
  projectContext?: ProjectContext,
): Promise<void> {
  const claudeOk = await isClaudeAvailable();
  if (!claudeOk) {
    log("");
    log(yellow("  Claude Code not found — can't write posts yet."));
    log("");

    for (const fmt of formats) {
      const outFile = resolveContentPath(outDir, fmt);
      await writeFile(outFile, fallbackContent(fmt, "no-claude"), "utf-8");
      if (!quiet) {
        log(`  ${dim(outFile)} ${dim("(open for setup instructions)")}`);
      }
    }

    log("");
    log(`  Install Claude Code → ${cyan("https://claude.ai/code")}`);
    log("");
    return;
  }

  if (formats.length === 1) {
    await generateSingle(formats[0], extraction, outDir, quiet, style, projectContext);
  } else {
    await generateParallel(formats, extraction, outDir, quiet, style, projectContext);
  }

  log("");
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  setupSignalHandlers();

  const opts = parseArgs(process.argv);

  if (opts.version) {
    log(`buildarc v${VERSION}`);
    return;
  }

  if (opts.help) {
    showHelp();
    return;
  }

  // ── Flag conflict detection ──────────────────────────────────────
  if (opts.noAi && opts.contentFormats.length > 0) {
    const flags = opts.contentFormats.map((f) => `--${f}`).join(", ");
    log(red(`  --no-ai conflicts with ${flags}`));
    log(dim("  Content generation requires AI. Remove --no-ai or the content flags."));
    process.exit(1);
  }

  if (opts.noAi && opts.style) {
    log(red("  --no-ai conflicts with --style"));
    log(dim("  Style variants only apply to AI-generated content."));
    process.exit(1);
  }

  // Resolve project path
  let projectPath = opts.projectPath;

  if (!projectPath) {
    projectPath = autoDetectProject();
    if (!projectPath) {
      log(red("  No Claude Code sessions found for this directory."));
      log("");
      log(dim("  buildarc needs you to have used Claude Code here first."));
      log(dim("  Build something, then come back — your story will be waiting."));
      log("");
      log(dim("  Or point to a specific project:"));
      log(dim("    buildarc ~/.claude/projects/-Users-you-projects-my-app/"));
      process.exit(1);
    }
  }

  projectPath = resolve(projectPath);

  const isJson = opts.format === "json";
  const outDir = resolve(opts.output ?? OUTPUT_DIR);
  ensureOutputDir(outDir);

  const extractionFile = join(outDir, isJson ? "buildarc.json" : "BUILDARC.md");

  if (!opts.quiet) {
    showHeader();
  }

  // ── Check if we can reuse a fresh extraction ──────────────────────
  // If content flags were passed directly (--tweet, --linkedin, --journal),
  // no filters are active, and extraction file is fresh — skip re-parsing.
  const hasFilters = opts.since != null || opts.sessions != null;
  const wantsContentOnly = opts.contentFormats.length > 0 && !hasFilters && !isJson;
  const cachedExtraction = wantsContentOnly && extractionIsFresh(extractionFile, projectPath);

  let extraction: string;

  if (cachedExtraction) {
    // Reuse existing extraction
    if (!opts.quiet) {
      log(dim("  Reusing your build summary"));
    }
    extraction = await readFile(extractionFile, "utf-8");
  } else {
    // Full parse → extract → write cycle
    if (!opts.quiet) {
      log(dim("  Reading your Claude Code sessions..."));
      log("");
    }

    const t0 = Date.now();
    const parseResult = await parseProject(projectPath);
    let sessions = parseResult.sessions;

    if (!opts.quiet && parseResult.totalLines > 0) {
      const skipRate = parseResult.totalSkipped / parseResult.totalLines;
      if (skipRate > 0.1) {
        log(
          yellow(
            `  Warning: ${parseResult.totalSkipped}/${parseResult.totalLines} lines skipped (${Math.round(skipRate * 100)}% malformed)`,
          ),
        );
      }
      if (parseResult.filesSkipped > 0) {
        log(yellow(`  Warning: ${parseResult.filesSkipped} file(s) could not be read`));
      }
    }

    if (opts.since) {
      const sinceDate = new Date(opts.since);
      sessions = sessions.filter((s) => new Date(s.startedAt) >= sinceDate);
    }

    if (opts.sessions) {
      sessions = sessions.slice(-opts.sessions);
    }

    if (sessions.length === 0) {
      if (opts.since || opts.sessions) {
        log(yellow("  No sessions match those filters."));
        log(dim("  Try without --since or --sessions to include everything."));
      } else {
        log(yellow("  No sessions found."));
        log(dim("  Build something with Claude Code first, then come back."));
      }
      return;
    }

    const buildLog = extractBuildLog(sessions, projectPath);

    if (!opts.quiet) {
      const { stats } = buildLog;
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const statsLine = `  ${bold(String(stats.totalSessions))} sessions  ${bold(String(stats.totalMoments))} moments  ${green(String(stats.decisions))} decisions  ${yellow(String(stats.pivots))} pivots`;
      log(rightAlign(statsLine, dim(`${elapsed}s`)));
    }

    const content = isJson ? formatJson(buildLog) : formatMarkdown(buildLog);

    await writeFile(extractionFile, content, "utf-8");

    if (!opts.quiet) {
      log(`  Saved to ${dim(extractionFile)}`);
    }

    // For AI content, always use markdown extraction
    extraction = isJson ? formatMarkdown(buildLog) : content;
  }

  // ── Content generation ────────────────────────────────────────────

  if (opts.noAi) return;
  if (isJson && opts.contentFormats.length === 0) return;

  const projectContext = gatherProjectContext();

  // Direct content flags — skip the menu
  if (opts.contentFormats.length > 0) {
    await runContentGeneration(
      opts.contentFormats,
      extraction,
      outDir,
      opts.quiet,
      opts.style,
      projectContext,
    );
    return;
  }

  // Interactive menu
  if (!process.stdin.isTTY) {
    if (!opts.quiet) {
      log(
        dim(
          "  Your build summary is in .buildarc/ — run with --tweet or --linkedin to generate posts.",
        ),
      );
    }
    return;
  }

  if (!opts.quiet) {
    log("");
    log(`  ${rule()}`);
  }

  const choice = await showMenu();

  if (!choice) {
    if (!opts.quiet) {
      log(dim("  Your build summary is in .buildarc/ — come back when you're ready to share."));
    }
    return;
  }

  const formats: ContentFormat[] =
    choice === "all" ? ["tweet", "linkedin", "journal"] : [choice as ContentFormat];

  // Show style sub-menu for single-format selections with multiple styles
  let style: string | null = opts.style;
  if (choice !== "all" && !style) {
    const picked = await showStyleMenu(choice as ContentFormat);
    if (picked) style = picked;
  }

  await runContentGeneration(formats, extraction, outDir, opts.quiet, style, projectContext);
}

main().catch((err) => {
  log(red(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
