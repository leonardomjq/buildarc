import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { join } from "node:path";
import type {
  ContentBlock,
  ParsedAssistantMessage,
  ParsedMessage,
  ParsedSession,
  ParsedUserMessage,
  RawAssistantEvent,
  RawUserEvent,
} from "./types.js";

const COMMAND_TAG_RE = /<command-name>/;
const MIN_ASSISTANT_TEXT_LEN = 20;

function isUserEvent(raw: Record<string, unknown>): boolean {
  return (
    raw.type === "user" &&
    raw.message != null &&
    typeof raw.message === "object" &&
    (raw.message as Record<string, unknown>).role === "user" &&
    typeof (raw.message as Record<string, unknown>).content === "string"
  );
}

function isAssistantEvent(
  raw: Record<string, unknown>,
): boolean {
  return (
    raw.type === "assistant" &&
    raw.message != null &&
    typeof raw.message === "object" &&
    (raw.message as Record<string, unknown>).role === "assistant" &&
    Array.isArray((raw.message as Record<string, unknown>).content)
  );
}

function extractUserMessage(event: RawUserEvent): ParsedUserMessage | null {
  const text = event.message.content.trim();
  if (!text) return null;
  if (COMMAND_TAG_RE.test(text)) return null;
  return { role: "user", text, timestamp: event.timestamp };
}

function extractAssistantMessage(
  event: RawAssistantEvent,
): ParsedAssistantMessage | null {
  const blocks = event.message.content as ContentBlock[];
  const textParts: string[] = [];
  const tools: string[] = [];

  for (const block of blocks) {
    if (block.type === "text" && block.text) {
      const trimmed = block.text.trim();
      if (trimmed.length >= MIN_ASSISTANT_TEXT_LEN) {
        textParts.push(trimmed);
      }
    } else if (block.type === "tool_use" && block.name) {
      tools.push(block.name);
    }
    // skip thinking, tool_result, etc.
  }

  if (textParts.length === 0 && tools.length === 0) return null;

  return {
    role: "assistant",
    text: textParts.join("\n\n"),
    tools,
    timestamp: event.timestamp,
  };
}

export async function parseFile(
  filePath: string,
): Promise<ParsedSession | null> {
  const messages: ParsedMessage[] = [];
  let sessionId = "";
  let slug = "";
  let startedAt = "";
  let endedAt = "";

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(line);
    } catch {
      continue; // malformed JSON, skip
    }

    // Skip non-message event types
    const eventType = raw.type as string;
    if (
      !eventType ||
      eventType === "file-history-snapshot" ||
      eventType === "progress" ||
      eventType === "system" ||
      eventType === "queue-operation"
    ) {
      continue;
    }

    // Capture session metadata from the first relevant event
    if (!sessionId && typeof raw.sessionId === "string") {
      sessionId = raw.sessionId;
    }
    if (!slug && typeof raw.slug === "string") {
      slug = raw.slug;
    }

    const ts = raw.timestamp as string | undefined;

    if (isUserEvent(raw)) {
      const msg = extractUserMessage(raw as unknown as RawUserEvent);
      if (msg) {
        if (!startedAt) startedAt = msg.timestamp;
        endedAt = msg.timestamp;
        messages.push(msg);
      }
    } else if (isAssistantEvent(raw)) {
      const msg = extractAssistantMessage(raw as unknown as RawAssistantEvent);
      if (msg) {
        if (!startedAt) startedAt = msg.timestamp;
        endedAt = msg.timestamp;
        messages.push(msg);
      }
    }

    // Update timestamps from raw event if we haven't captured from messages
    if (ts) {
      if (!startedAt) startedAt = ts;
      endedAt = ts;
    }
  }

  if (messages.length === 0) return null;

  return {
    sessionId: sessionId || filePath,
    slug: slug || "unnamed",
    startedAt,
    endedAt,
    messages,
  };
}

export async function parseProject(
  dirPath: string,
): Promise<ParsedSession[]> {
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    throw new Error(`Cannot read project directory: ${dirPath}`);
  }

  const jsonlFiles = entries
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => join(dirPath, f));

  if (jsonlFiles.length === 0) {
    throw new Error(`No .jsonl transcript files found in: ${dirPath}`);
  }

  const sessions: ParsedSession[] = [];

  for (const file of jsonlFiles) {
    try {
      const session = await parseFile(file);
      if (session) {
        sessions.push(session);
      }
    } catch {
      // Skip files that can't be parsed
      continue;
    }
  }

  // Sort by start time
  sessions.sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  return sessions;
}
