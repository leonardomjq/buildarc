import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFile, parseProject } from "../parser.js";

function makeTmpDir(): string {
  const dir = join(tmpdir(), `buildarc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeJsonl(dir: string, filename: string, lines: unknown[]): string {
  const filePath = join(dir, filename);
  writeFileSync(filePath, lines.map((l) => JSON.stringify(l)).join("\n"), "utf-8");
  return filePath;
}

// ── parseFile ──────────────────────────────────────────────────────

describe("parseFile", () => {
  it("parses a valid session with user and assistant messages", async () => {
    const dir = makeTmpDir();
    const filePath = writeJsonl(dir, "session.jsonl", [
      {
        type: "user",
        sessionId: "sess-1",
        slug: "test-session",
        timestamp: "2026-01-15T10:00:00Z",
        message: { role: "user", content: "Build a login page" },
      },
      {
        type: "assistant",
        sessionId: "sess-1",
        slug: "test-session",
        timestamp: "2026-01-15T10:01:00Z",
        message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "I'll create a login page component for you with email and password fields.",
            },
          ],
        },
      },
    ]);

    const result = await parseFile(filePath);
    expect(result.session).not.toBeNull();
    expect(result.session!.sessionId).toBe("sess-1");
    expect(result.session!.slug).toBe("test-session");
    expect(result.session!.messages).toHaveLength(2);
    expect(result.skippedLines).toBe(0);
    expect(result.totalLines).toBe(2);

    rmSync(dir, { recursive: true });
  });

  it("counts malformed JSON lines", async () => {
    const dir = makeTmpDir();
    const filePath = join(dir, "bad.jsonl");
    writeFileSync(
      filePath,
      [
        '{"type":"user","sessionId":"s1","timestamp":"2026-01-15T10:00:00Z","message":{"role":"user","content":"hello"}}',
        "this is not json",
        "{malformed json{",
        '{"type":"assistant","sessionId":"s1","timestamp":"2026-01-15T10:01:00Z","message":{"role":"assistant","content":[{"type":"text","text":"I can help you with that request."}]}}',
      ].join("\n"),
      "utf-8",
    );

    const result = await parseFile(filePath);
    expect(result.skippedLines).toBe(2);
    expect(result.totalLines).toBe(4);
    expect(result.session).not.toBeNull();
    expect(result.session!.messages).toHaveLength(2);

    rmSync(dir, { recursive: true });
  });

  it("returns null session for empty file", async () => {
    const dir = makeTmpDir();
    const filePath = join(dir, "empty.jsonl");
    writeFileSync(filePath, "", "utf-8");

    const result = await parseFile(filePath);
    expect(result.session).toBeNull();
    expect(result.totalLines).toBe(0);

    rmSync(dir, { recursive: true });
  });

  it("filters out command-tag messages", async () => {
    const dir = makeTmpDir();
    const filePath = writeJsonl(dir, "commands.jsonl", [
      {
        type: "user",
        sessionId: "s1",
        timestamp: "2026-01-15T10:00:00Z",
        message: { role: "user", content: "<command-name>help</command-name>" },
      },
      {
        type: "user",
        sessionId: "s1",
        timestamp: "2026-01-15T10:01:00Z",
        message: { role: "user", content: "Build something cool" },
      },
    ]);

    const result = await parseFile(filePath);
    expect(result.session).not.toBeNull();
    expect(result.session!.messages).toHaveLength(1);
    expect(result.session!.messages[0].text).toBe("Build something cool");

    rmSync(dir, { recursive: true });
  });

  it("skips non-message event types", async () => {
    const dir = makeTmpDir();
    const filePath = writeJsonl(dir, "events.jsonl", [
      { type: "system", data: "init" },
      { type: "progress", value: 50 },
      { type: "file-history-snapshot", files: [] },
      {
        type: "user",
        sessionId: "s1",
        timestamp: "2026-01-15T10:00:00Z",
        message: { role: "user", content: "hello world" },
      },
    ]);

    const result = await parseFile(filePath);
    expect(result.session).not.toBeNull();
    expect(result.session!.messages).toHaveLength(1);

    rmSync(dir, { recursive: true });
  });
});

// ── parseProject ───────────────────────────────────────────────────

describe("parseProject", () => {
  it("parses all .jsonl files in a directory", async () => {
    const dir = makeTmpDir();
    writeJsonl(dir, "a.jsonl", [
      {
        type: "user",
        sessionId: "s1",
        timestamp: "2026-01-15T10:00:00Z",
        message: { role: "user", content: "First session" },
      },
    ]);
    writeJsonl(dir, "b.jsonl", [
      {
        type: "user",
        sessionId: "s2",
        timestamp: "2026-01-16T10:00:00Z",
        message: { role: "user", content: "Second session" },
      },
    ]);

    const result = await parseProject(dir);
    expect(result.sessions).toHaveLength(2);
    expect(result.totalSkipped).toBe(0);
    expect(result.filesSkipped).toBe(0);

    rmSync(dir, { recursive: true });
  });

  it("sorts sessions by start time", async () => {
    const dir = makeTmpDir();
    writeJsonl(dir, "later.jsonl", [
      {
        type: "user",
        sessionId: "s2",
        timestamp: "2026-01-20T10:00:00Z",
        message: { role: "user", content: "Later" },
      },
    ]);
    writeJsonl(dir, "earlier.jsonl", [
      {
        type: "user",
        sessionId: "s1",
        timestamp: "2026-01-10T10:00:00Z",
        message: { role: "user", content: "Earlier" },
      },
    ]);

    const result = await parseProject(dir);
    expect(result.sessions[0].sessionId).toBe("s1");
    expect(result.sessions[1].sessionId).toBe("s2");

    rmSync(dir, { recursive: true });
  });

  it("throws on nonexistent directory", async () => {
    await expect(parseProject("/nonexistent/path/xyz")).rejects.toThrow(
      "Cannot read project directory",
    );
  });

  it("throws when no .jsonl files found", async () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, "readme.txt"), "not a jsonl file", "utf-8");

    await expect(parseProject(dir)).rejects.toThrow("No .jsonl transcript files found");

    rmSync(dir, { recursive: true });
  });

  it("aggregates skip stats across files", async () => {
    const dir = makeTmpDir();
    const filePath = join(dir, "mixed.jsonl");
    writeFileSync(
      filePath,
      [
        '{"type":"user","sessionId":"s1","timestamp":"2026-01-15T10:00:00Z","message":{"role":"user","content":"hello"}}',
        "bad line 1",
        "bad line 2",
      ].join("\n"),
      "utf-8",
    );

    const result = await parseProject(dir);
    expect(result.totalSkipped).toBe(2);
    expect(result.totalLines).toBe(3);

    rmSync(dir, { recursive: true });
  });
});
