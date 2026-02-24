#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { parseProject } from "./parser.js";
import { extractBuildLog } from "./extractor.js";
import { formatMarkdown, formatJson } from "./formatter.js";
import { isClaudeAvailable, generateContent } from "./storyteller.js";
import { STYLE_OPTIONS } from "./prompts.js";
import type { CliOptions, ContentFormat, OutputFormat } from "./types.js";

// ── Version ─────────────────────────────────────────────────────────

const VERSION = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
).version;

// ── ANSI colors (respects NO_COLOR: https://no-color.org/) ──────────

const noColor =
  "NO_COLOR" in process.env ||
  process.env.TERM === "dumb" ||
  !process.stderr.isTTY;

const dim = noColor ? (s: string) => s : (s: string) => `\x1b[2m${s}\x1b[22m`;
const bold = noColor ? (s: string) => s : (s: string) => `\x1b[1m${s}\x1b[22m`;
const green = noColor ? (s: string) => s : (s: string) => `\x1b[32m${s}\x1b[39m`;
const cyan = noColor ? (s: string) => s : (s: string) => `\x1b[36m${s}\x1b[39m`;
const yellow = noColor ? (s: string) => s : (s: string) => `\x1b[33m${s}\x1b[39m`;
const red = noColor ? (s: string) => s : (s: string) => `\x1b[31m${s}\x1b[39m`;

// ── Logging (stderr so content goes to files cleanly) ───────────────

function log(msg: string) {
  process.stderr.write(msg + "\n");
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
        if (isNaN(new Date(dateStr).getTime())) {
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
        const n = parseInt(args[++i], 10);
        if (isNaN(n) || n <= 0) {
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

// ── Interactive menu ────────────────────────────────────────────────

async function showMenu(): Promise<string | null> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  log("");
  log(bold("  What do you want to share?"));
  log("");
  log(`    ${cyan("1.")} Tweet thread`);
  log(`    ${cyan("2.")} LinkedIn post`);
  log(`    ${cyan("3.")} Build journal`);
  log(`    ${cyan("4.")} All of the above`);
  log(`    ${cyan("5.")} Just the summary`);
  log("");

  return new Promise((resolve) => {
    rl.on("close", () => resolve(null)); // Ctrl+C or Ctrl+D
    rl.question(`  ${dim("Choose (1-5):")} `, (answer) => {
      rl.close();
      const choice = answer.trim();
      switch (choice) {
        case "1":
          resolve("tweet");
          break;
        case "2":
          resolve("linkedin");
          break;
        case "3":
          resolve("journal");
          break;
        case "4":
          resolve("all");
          break;
        case "5":
        case "":
          resolve(null);
          break;
        default:
          resolve(null);
      }
    });
  });
}

// ── Style sub-menu ──────────────────────────────────────────────────

const STYLE_LABELS: Record<string, string> = {
  narrative: "Narrative (build story thread)",
  shitpost: "Shitpost (absurdist daylog)",
};

async function showStyleMenu(format: ContentFormat): Promise<string | null> {
  const styles = STYLE_OPTIONS[format];
  if (!styles || styles.length <= 1) return null;

  const rl = createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  log("");
  log(bold("  What vibe?"));
  log("");
  for (let j = 0; j < styles.length; j++) {
    log(`    ${cyan(`${j + 1}.`)} ${STYLE_LABELS[styles[j]] ?? styles[j]}`);
  }
  log("");

  return new Promise((resolve) => {
    rl.on("close", () => resolve(null));
    rl.question(`  ${dim(`Choose (1-${styles.length}):`)} `, (answer) => {
      rl.close();
      const idx = parseInt(answer.trim(), 10) - 1;
      if (idx >= 0 && idx < styles.length) {
        resolve(styles[idx]);
      } else {
        resolve(null); // defaults to narrative
      }
    });
  });
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
  --tweet              Generate X/Twitter thread (skips menu)
  --linkedin           Generate LinkedIn post (skips menu)
  --journal            Generate build journal (skips menu)
  --style <name>       Content style variant (e.g. narrative, shitpost)
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

  ${dim("# Generate tweet thread directly (no menu)")}
  buildarc --tweet

  ${dim("# Shitpost-style tweet (absurdist daylog)")}
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
    // Only cache markdown extractions (not JSON — different structure)
    if (!outputFile.endsWith(".md")) return false;
    const outputMtime = statSync(outputFile).mtimeMs;
    // We can't check jsonl mtimes synchronously in the async flow,
    // so this is a quick heuristic: if the file exists and is < 5 min old, reuse it
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    return outputMtime > fiveMinAgo;
  } catch {
    return false;
  }
}

// ── Content generation ──────────────────────────────────────────────

const CONTENT_LABELS: Record<string, string> = {
  tweet: "tweet thread",
  linkedin: "LinkedIn post",
  journal: "build journal",
};

const CONTENT_NUDGES: Record<string, string> = {
  tweet: "paste into X",
  linkedin: "paste into LinkedIn",
  journal: "publish or keep for yourself",
};

const FILE_COMMENTS: Record<string, string> = {
  tweet: "buildarc tweet thread — copy below, paste into X",
  linkedin: "buildarc LinkedIn post — copy below, paste into LinkedIn",
  journal: "buildarc build journal — publish as-is or edit to taste",
};

const PREVIEW_LINES = 6;
const PREVIEW_MAX_WIDTH = 72;

function withFileComment(content: string, fmt: string): string {
  const comment = FILE_COMMENTS[fmt];
  if (!comment) return content;
  return `<!-- ${comment} -->\n\n${content}`;
}

function showPreview(content: string): void {
  const lines = content.trimStart().split("\n").slice(0, PREVIEW_LINES);
  log("");
  for (const line of lines) {
    const display = line.length > PREVIEW_MAX_WIDTH
      ? line.slice(0, PREVIEW_MAX_WIDTH - 1) + "\u2026"
      : line;
    log(`  ${dim("\u2502")} ${display}`);
  }
  const totalLines = content.trimStart().split("\n").length;
  if (totalLines > PREVIEW_LINES) {
    log(`  ${dim("\u2502")} ${dim("\u2026")}`);
  }
}

function fallbackContent(fmt: string, reason: "no-claude" | "error", errorMsg?: string): string {
  const retryCmd = `npx buildarc --${fmt}`;
  const label = CONTENT_LABELS[fmt] ?? fmt;

  if (reason === "no-claude") {
    return [
      `# Almost there`,
      "",
      `buildarc found your build story (check BUILDARC.md), but it needs`,
      `Claude Code installed to write your ${label}.`,
      "",
      `1. Install Claude Code: https://claude.ai/code`,
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

async function runContentGeneration(
  formats: readonly ContentFormat[],
  extraction: string,
  outDir: string,
  quiet: boolean,
  style: string | null,
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

  for (const fmt of formats) {
    if (!quiet) {
      log("");
      log(dim(`  Writing your ${CONTENT_LABELS[fmt]}...`));
    }

    try {
      const effectiveStyle = style ?? "narrative";
      const availableStyles = STYLE_OPTIONS[fmt] ?? ["narrative"];
      if (style && !availableStyles.includes(style)) {
        if (!quiet) {
          log(yellow(`  Style "${style}" not available for ${fmt}, using narrative.`));
        }
      }
      const resolvedStyle = availableStyles.includes(effectiveStyle)
        ? effectiveStyle
        : "narrative";
      const result = await generateContent(extraction, fmt, resolvedStyle);
      const outFile = resolveContentPath(outDir, fmt);
      await writeFile(outFile, withFileComment(result, fmt) + "\n", "utf-8");
      if (!quiet) {
        showPreview(result);
        log("");
        log(`  ${green(CONTENT_LABELS[fmt])} → ${outFile} — ${CONTENT_NUDGES[fmt]}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(red(`  Couldn't write your ${CONTENT_LABELS[fmt]}: ${msg}`));
      const outFile = resolveContentPath(outDir, fmt);
      await writeFile(outFile, fallbackContent(fmt, "error", msg), "utf-8");
      if (!quiet) {
        log(dim(`  Details in ${outFile}`));
      }
    }
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
    log("");
    log(`  ${bold("buildarc")} ${dim(`v${VERSION}`)}`);
    log("");
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
      log(dim(`  Reusing your build summary`));
    }
    extraction = await readFile(extractionFile, "utf-8");
  } else {
    // Full parse → extract → write cycle
    if (!opts.quiet) {
      log(dim(`  Reading your Claude Code sessions...`));
    }

    let sessions = await parseProject(projectPath);

    if (opts.since) {
      const sinceDate = new Date(opts.since);
      sessions = sessions.filter(
        (s) => new Date(s.startedAt) >= sinceDate,
      );
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
      log(
        `  Found ${bold(String(stats.totalSessions))} sessions | ${bold(String(stats.totalMoments))} moments | ${green(String(stats.decisions))} decisions, ${yellow(String(stats.pivots))} pivots`,
      );
    }

    const content = isJson
      ? formatJson(buildLog)
      : formatMarkdown(buildLog);

    await writeFile(extractionFile, content, "utf-8");

    if (!opts.quiet) {
      log(`  Build summary saved to ${green(extractionFile)}`);
    }

    // For AI content, always use markdown extraction
    extraction = isJson ? formatMarkdown(buildLog) : content;
  }

  // ── Content generation ────────────────────────────────────────────

  if (opts.noAi) return;
  if (isJson && opts.contentFormats.length === 0) return;

  // Direct content flags — skip the menu
  if (opts.contentFormats.length > 0) {
    await runContentGeneration(opts.contentFormats, extraction, outDir, opts.quiet, opts.style);
    return;
  }

  // Interactive menu
  if (!process.stdin.isTTY) {
    if (!opts.quiet) {
      log(dim("  Your build summary is in .buildarc/ — run with --tweet or --linkedin to generate posts."));
    }
    return;
  }

  const choice = await showMenu();

  if (!choice) {
    if (!opts.quiet) {
      log(dim("  Your build summary is in .buildarc/ — come back when you're ready to share."));
    }
    return;
  }

  const formats: ContentFormat[] =
    choice === "all"
      ? ["tweet", "linkedin", "journal"]
      : [choice as ContentFormat];

  // Show style sub-menu for single-format selections with multiple styles
  let style: string | null = opts.style;
  if (choice !== "all" && !style) {
    const picked = await showStyleMenu(choice as ContentFormat);
    if (picked) style = picked;
  }

  await runContentGeneration(formats, extraction, outDir, opts.quiet, style);
}

main().catch((err) => {
  log(red(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
