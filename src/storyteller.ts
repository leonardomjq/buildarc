import { spawn } from "node:child_process";
import { PROMPTS } from "./prompts.js";
import type { ProjectContext } from "./types.js";

type StoryFormat = "tweet" | "linkedin" | "journal";

function formatProjectContext(ctx: ProjectContext): string {
  const lines: string[] = ["## Project", ""];
  if (ctx.name) lines.push(`- **Name:** ${ctx.name}`);
  if (ctx.description) lines.push(`- **What it does:** ${ctx.description}`);
  if (ctx.repoUrl) lines.push(`- **Repo:** ${ctx.repoUrl}`);
  if (ctx.homepageUrl) lines.push(`- **Homepage:** ${ctx.homepageUrl}`);
  if (ctx.installCommand) lines.push(`- **Install:** \`${ctx.installCommand}\``);
  return lines.join("\n");
}

function hasProjectContext(ctx: ProjectContext): boolean {
  return (
    ctx.name != null ||
    ctx.description != null ||
    ctx.repoUrl != null ||
    ctx.homepageUrl != null ||
    ctx.installCommand != null
  );
}

export async function isClaudeAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("which", ["claude"], { stdio: "ignore" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

const TIMEOUT_MS = 120_000; // 2 minutes

export async function generateContent(
  extraction: string,
  format: StoryFormat,
  style?: string,
  projectContext?: ProjectContext,
): Promise<string> {
  const formatPrompts = PROMPTS[format];
  const defaultStyle = format === "tweet" ? "thread" : "narrative";
  const systemPrompt = formatPrompts[style ?? defaultStyle] ?? formatPrompts[defaultStyle];

  return new Promise((resolve, reject) => {
    // Remove CLAUDECODE env var so buildarc can spawn claude from inside a Claude Code session
    const env = { ...process.env };
    env.CLAUDECODE = undefined;

    const proc = spawn(
      "claude",
      ["-p", "--output-format", "text", "--model", "sonnet", "--system-prompt", systemPrompt],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
      },
    );

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timeout = setTimeout(() => {
      killed = true;
      proc.kill();
      reject(new Error("claude timed out after 2 minutes"));
    }, TIMEOUT_MS);

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (killed) return;
      if (code !== 0) {
        reject(new Error(`claude exited with code ${code}${stderr ? `: ${stderr.trim()}` : ""}`));
        return;
      }
      const output = stdout.trim();
      if (!output) {
        reject(new Error("claude returned empty output"));
        return;
      }
      resolve(output);
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      if (killed) return;
      reject(new Error(`Failed to spawn claude: ${err.message}`));
    });

    // Project context (if available) + extraction go via stdin
    if (projectContext && hasProjectContext(projectContext)) {
      proc.stdin.write(formatProjectContext(projectContext));
      proc.stdin.write("\n\n---\n\n");
    }
    proc.stdin.write(extraction);
    proc.stdin.end();
  });
}
