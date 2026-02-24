// ── Secret scrubber ────────────────────────────────────────────────
// Detects and redacts secrets from extracted text before it reaches
// shareable content. Returns the scrubbed text and a count of redactions.

export interface ScrubResult {
  text: string;
  redactionCount: number;
}

// ── Patterns ───────────────────────────────────────────────────────

const PATTERNS: { re: RegExp; label: string }[] = [
  // Known-prefix API keys — patterns likely to appear in Claude Code sessions
  { re: /\bsk-[A-Za-z0-9]{20,}\b/g, label: "openai-key" },
  { re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, label: "github-token" },

  // Bearer tokens
  { re: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi, label: "bearer-token" },

  // Connection strings (redact everything after the scheme)
  {
    re: /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis|amqp|amqps):\/\/\S+/gi,
    label: "connection-string",
  },

  // Env-style secret assignments: KEY=value (value is the secret part)
  {
    re: /\b(?:DATABASE_URL|DB_URL|API_KEY|API_SECRET|SECRET_KEY|AUTH_SECRET|JWT_SECRET|SESSION_SECRET|ENCRYPTION_KEY|PRIVATE_KEY|ACCESS_TOKEN|REFRESH_TOKEN|CLIENT_SECRET|APP_SECRET|WEBHOOK_SECRET|SIGNING_SECRET|MASTER_KEY|ADMIN_KEY|SERVICE_KEY|SUPABASE_KEY|NEXTAUTH_SECRET|OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN)\s*[=:]\s*\S+/gi,
    label: "env-secret",
  },

  // Generic token/key assignments near auth-adjacent words
  {
    re: /\b(?:token|api_key|apikey|secret|password|passwd|credentials)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/]{8,}["']?/gi,
    label: "generic-secret",
  },
];

const REDACTED = "[REDACTED]";

export function scrub(text: string): ScrubResult {
  let result = text;
  let redactionCount = 0;

  for (const { re } of PATTERNS) {
    // Reset lastIndex for global regexes
    re.lastIndex = 0;
    const matches = result.match(re);
    if (matches) {
      redactionCount += matches.length;
      result = result.replace(re, REDACTED);
    }
  }

  return { text: result, redactionCount };
}
