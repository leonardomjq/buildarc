import { spawn } from "node:child_process";
import { PROMPTS } from "./prompts.js";

type StoryFormat = "tweet" | "linkedin" | "journal";

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
): Promise<string> {
  const formatPrompts = PROMPTS[format];
  const systemPrompt = formatPrompts[style ?? "narrative"] ?? formatPrompts.narrative;

  return new Promise((resolve, reject) => {
    const proc = spawn(
      "claude",
      ["-p", "--output-format", "text", "--model", "sonnet", "--system-prompt", systemPrompt],
      {
        stdio: ["pipe", "pipe", "pipe"],
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

    // Extraction goes via stdin, system prompt via --system-prompt flag
    proc.stdin.write(extraction);
    proc.stdin.end();
  });
}
