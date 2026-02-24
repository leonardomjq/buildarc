import { describe, expect, it } from "vitest";
import { scrub } from "../scrubber.js";

describe("scrub", () => {
  // ── Known-prefix API keys ──────────────────────────────────────

  it("redacts OpenAI keys (sk-...)", () => {
    const input = "Using key sk-abc123def456ghi789jkl012mno345pqr678";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe("Using key [REDACTED]");
    expect(redactionCount).toBe(1);
  });

  it("redacts GitHub tokens (ghp_, ghu_, ghs_, gho_, ghr_)", () => {
    const prefixes = ["ghp_", "ghu_", "ghs_", "gho_", "ghr_"];
    for (const prefix of prefixes) {
      const token = `${prefix}${"a".repeat(36)}`;
      const { text } = scrub(`token: ${token}`);
      expect(text).toBe("token: [REDACTED]");
    }
  });

  // ── Bearer tokens ──────────────────────────────────────────────

  it("redacts Bearer tokens", () => {
    const { text } = scrub(
      "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig",
    );
    expect(text).toBe("Authorization: [REDACTED]");
  });

  // ── Connection strings ─────────────────────────────────────────

  it("redacts postgres connection strings", () => {
    const { text } = scrub("DATABASE_URL=postgres://user:pass@host:5432/db");
    expect(text).not.toContain("user:pass");
    expect(text).toContain("[REDACTED]");
  });

  it("redacts mongodb+srv connection strings", () => {
    const { text } = scrub("mongodb+srv://admin:secret@cluster0.mongodb.net/mydb");
    expect(text).toBe("[REDACTED]");
  });

  it("redacts redis connection strings", () => {
    const { text } = scrub("redis://default:password@redis-host:6379");
    expect(text).toBe("[REDACTED]");
  });

  // ── Env-style secrets ──────────────────────────────────────────

  it("redacts DATABASE_URL assignments", () => {
    const { text } = scrub("DATABASE_URL=postgres://localhost/mydb");
    expect(text).toContain("[REDACTED]");
    expect(text).not.toContain("localhost");
  });

  it("redacts API_KEY assignments", () => {
    const { text } = scrub('API_KEY="my-secret-api-key-12345"');
    expect(text).toContain("[REDACTED]");
    expect(text).not.toContain("my-secret-api-key");
  });

  it("redacts OPENAI_API_KEY assignments", () => {
    const { text } = scrub("OPENAI_API_KEY=sk-abc123xyz456");
    expect(text).toContain("[REDACTED]");
    expect(text).not.toContain("abc123");
  });

  // ── Generic token assignments ──────────────────────────────────

  it("redacts token=value patterns", () => {
    const { text } = scrub('token="abcdef123456789012345"');
    expect(text).toContain("[REDACTED]");
  });

  it("redacts password: value patterns", () => {
    const { text } = scrub("password: supersecretpassword123");
    expect(text).toContain("[REDACTED]");
  });

  // ── False-positive guards ──────────────────────────────────────

  it("does NOT redact normal prose", () => {
    const input = "I decided to skip the authentication step and focus on the UI.";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });

  it("does NOT redact file paths", () => {
    const input = "Updated src/components/auth/login.tsx with the new styles.";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });

  it("does NOT redact npm package names", () => {
    const input = "Added next-auth and @prisma/client as dependencies.";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });

  it("does NOT redact short identifiers", () => {
    const input = "session id: abc123";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });

  it("does NOT redact the word 'token' without a value", () => {
    const input = "We need to refresh the token when it expires.";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });

  // ── Multiple secrets ───────────────────────────────────────────

  it("redacts multiple secrets in one string", () => {
    const input =
      "Keys: sk-abc123def456ghi789jkl012mno345pqr678 and ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe("Keys: [REDACTED] and [REDACTED]");
    expect(redactionCount).toBe(2);
  });

  // ── Empty/trivial input ────────────────────────────────────────

  it("handles empty string", () => {
    const { text, redactionCount } = scrub("");
    expect(text).toBe("");
    expect(redactionCount).toBe(0);
  });

  it("handles string with no secrets", () => {
    const input = "Just a normal conversation about building a feature.";
    const { text, redactionCount } = scrub(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });
});
