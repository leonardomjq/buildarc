import { describe, expect, it } from "vitest";
import { TYPE_PRIORITY, classifyText } from "../extractor.js";

describe("classifyText", () => {
  // ── DECISION ───────────────────────────────────────────────────

  it("classifies 'let's go with' as DECISION", () => {
    expect(classifyText("let's go with Tailwind for styling")).toContain("DECISION");
  });

  it("classifies 'I decided' as DECISION", () => {
    expect(classifyText("I decided to use a monorepo")).toContain("DECISION");
  });

  it("classifies 'switching to' as DECISION", () => {
    expect(classifyText("switching to pnpm from npm")).toContain("DECISION");
  });

  it("classifies 'I want to build' as DECISION", () => {
    expect(classifyText("I want to build a CLI tool")).toContain("DECISION");
  });

  it("classifies 'I don't want any' as DECISION", () => {
    expect(classifyText("I don't want any runtime dependencies")).toContain("DECISION");
  });

  // ── PIVOT ──────────────────────────────────────────────────────

  it("classifies 'scrap this' as PIVOT", () => {
    expect(classifyText("scrap this, it's not working")).toContain("PIVOT");
  });

  it("classifies 'wrong approach' as PIVOT", () => {
    expect(classifyText("wrong approach, we need to rethink")).toContain("PIVOT");
  });

  it("classifies 'actually let's' as PIVOT", () => {
    expect(classifyText("actually let's do it differently")).toContain("PIVOT");
  });

  it("classifies 'scratch that' as PIVOT", () => {
    expect(classifyText("scratch that, new idea")).toContain("PIVOT");
  });

  it("classifies 'doesn't work' as PIVOT", () => {
    expect(classifyText("this doesn't work at all")).toContain("PIVOT");
  });

  // ── EMOTION ────────────────────────────────────────────────────

  it("classifies 'frustrated' as EMOTION", () => {
    expect(classifyText("I'm so frustrated with this bug")).toContain("EMOTION");
  });

  it("classifies 'breakthrough' as EMOTION", () => {
    expect(classifyText("finally a breakthrough!")).toContain("EMOTION");
  });

  it("classifies 'love this' as EMOTION", () => {
    expect(classifyText("love this approach")).toContain("EMOTION");
  });

  it("classifies 'hell yes' as EMOTION", () => {
    expect(classifyText("hell yes it works!")).toContain("EMOTION");
  });

  // ── DIRECTIVE ──────────────────────────────────────────────────

  it("classifies 'build a login page' as DIRECTIVE (user only)", () => {
    expect(classifyText("build a login page", "user")).toContain("DIRECTIVE");
  });

  it("does NOT classify directive text from assistant", () => {
    expect(classifyText("build a login page", "assistant")).not.toContain("DIRECTIVE");
  });

  it("classifies 'fix the auth bug' as DIRECTIVE", () => {
    expect(classifyText("fix the auth bug in login", "user")).toContain("DIRECTIVE");
  });

  // ── QUESTION ───────────────────────────────────────────────────

  it("classifies question marks as QUESTION (user only)", () => {
    expect(classifyText("should we use Redis for caching?", "user")).toContain("QUESTION");
  });

  it("does NOT classify question text from assistant", () => {
    expect(classifyText("should we use Redis?", "assistant")).not.toContain("QUESTION");
  });

  // ── Multiple types ─────────────────────────────────────────────

  it("returns multiple types when text matches several patterns", () => {
    const types = classifyText("I'm frustrated, let's scrap this and start over", "user");
    expect(types).toContain("EMOTION");
    expect(types).toContain("PIVOT");
  });

  // ── No match ───────────────────────────────────────────────────

  it("returns empty array for neutral text", () => {
    expect(classifyText("The function returns a string")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(classifyText("")).toEqual([]);
  });
});

describe("TYPE_PRIORITY", () => {
  it("ranks PIVOT highest", () => {
    expect(TYPE_PRIORITY.PIVOT).toBeGreaterThan(TYPE_PRIORITY.EMOTION);
    expect(TYPE_PRIORITY.PIVOT).toBeGreaterThan(TYPE_PRIORITY.DECISION);
  });

  it("ranks DIRECTIVE lowest", () => {
    expect(TYPE_PRIORITY.DIRECTIVE).toBeLessThan(TYPE_PRIORITY.QUESTION);
  });
});
