import type {
  BuildLog,
  BuildStats,
  Moment,
  MomentType,
  ParsedAssistantMessage,
  ParsedMessage,
  ParsedSession,
  Session,
} from "./types.js";

// ── Noise filters ──────────────────────────────────────────────────

/** Messages that are not narrative beats — plan pastes, context resumptions, system noise */
const MESSAGE_NOISE: RegExp[] = [
  /^implement the following plan/i,
  /^this session is being continued from a previous/i,
  /^<task-notification>/i,
];

/** Assistant-only filler — status updates, greetings, Claude narrating its own actions */
const ASSISTANT_FILLER: RegExp[] = [
  /^(?:build|typecheck)\s+(?:passes|succeeds|is clean|check)/i,
  /^(?:good|clean|done|all)\s*[.,]\s/i,
  /^hey!?\s+how can i help/i,
  /^now (?:let me|fix|update|rewrite|create)\b/i,
  /^(?:update|create|add|remove) the\b/i,
];

function isNoise(text: string, role: "user" | "assistant"): boolean {
  for (const re of MESSAGE_NOISE) {
    if (re.test(text)) return true;
  }
  if (role === "assistant") {
    for (const re of ASSISTANT_FILLER) {
      if (re.test(text)) return true;
    }
  }
  return false;
}

// ── Regex patterns for moment classification ────────────────────────

interface PatternRule {
  type: MomentType;
  re: RegExp;
  roles?: Array<"user" | "assistant">;
}

const PATTERNS: PatternRule[] = [
  {
    type: "DECISION",
    re: /\b(?:let's\s+(?:go\s+with|do|use|try|build|ship)|i\s+decided|i\s+(?:do\s+not\s+|don't\s+)?want\s+(?:to|us|a|an|this|any)|going\s+to\s+(?:build|use|go\s+with)|we(?:'re|\s+are)\s+going\s+(?:to|with)|chose\s+to|decided\s+(?:to|on)|i(?:'d|\s+would)\s+like\s+(?:to|for|us)|the\s+plan\s+is|switching\s+to)\b/i,
  },
  {
    type: "PIVOT",
    re: /\b(?:pivot|change\s+direction|scrap\s+(?:this|that|it)|actually\s+let's|start\s+over|wrong\s+approach|rethink|scratch\s+that|take\s+a\s+step\s+back|doesn(?:'t| not)\s+(?:work|make\s+sense)|hold\s+on|killed|salvage|paused?|back\s+to\s+(?:the\s+)?drawing\s+board)\b/i,
  },
  {
    type: "EMOTION",
    re: /\b(?:frustrat(?:ed|ing)|excit(?:ed|ing)|love\s+(?:this|it|our)|stuck|breakthrough|amazing|hate\s+(?:this|it)|finally|hell\s+yes|damn|shit|beautiful|ugly|nightmare|painful|brilliant|cringe|honestly)\b/i,
  },
  {
    type: "DIRECTIVE",
    roles: ["user"],
    re: /^(?:build|create|add|fix|update|remove|refactor|delete|rename|move|extract|migrate|deploy|ship|set\s+up|write|design|optimize|use|run|help|think)\s+/im,
  },
  {
    type: "QUESTION",
    roles: ["user"],
    re: /\?\s*$/m,
  },
];

export const TYPE_PRIORITY: Record<MomentType, number> = {
  PIVOT: 5,
  EMOTION: 4,
  DECISION: 3,
  QUESTION: 2,
  DIRECTIVE: 1,
};

export function classifyText(
  text: string,
  role: "user" | "assistant" = "user",
): MomentType[] {
  const types: MomentType[] = [];
  for (const { type, re, roles } of PATTERNS) {
    if (roles && !roles.includes(role)) continue;
    if (re.test(text)) {
      types.push(type);
    }
  }
  return types;
}

function extractMoments(messages: ParsedMessage[]): Moment[] {
  const moments: Moment[] = [];

  for (const msg of messages) {
    const text = msg.text;
    if (!text) continue;

    // Skip noise messages
    if (isNoise(text, msg.role)) continue;

    const types = classifyText(text, msg.role);
    if (types.length > 0) {
      const best = types.reduce((a, b) =>
        TYPE_PRIORITY[a] >= TYPE_PRIORITY[b] ? a : b,
      );
      const maxLen = msg.role === "user" ? 500 : 200;
      const excerpt =
        text.length > maxLen ? text.slice(0, maxLen) + "..." : text;

      moments.push({
        type: best,
        text: excerpt,
        role: msg.role,
        timestamp: msg.timestamp,
      });
    }
  }

  return moments;
}

function collectTools(messages: ParsedMessage[]): string[] {
  const toolSet = new Set<string>();
  for (const msg of messages) {
    if (msg.role === "assistant") {
      const assistantMsg = msg as ParsedAssistantMessage;
      for (const tool of assistantMsg.tools) {
        toolSet.add(tool);
      }
    }
  }
  return [...toolSet];
}

export function extractSession(parsed: ParsedSession): Session {
  const moments = extractMoments(parsed.messages);
  const tools = collectTools(parsed.messages);

  const userMessages = parsed.messages.filter(
    (m) => m.role === "user",
  ).length;
  const assistantMessages = parsed.messages.filter(
    (m) => m.role === "assistant",
  ).length;

  const date = parsed.startedAt
    ? new Date(parsed.startedAt).toISOString().split("T")[0]
    : "unknown";

  return {
    sessionId: parsed.sessionId,
    slug: parsed.slug,
    date,
    startedAt: parsed.startedAt,
    endedAt: parsed.endedAt,
    userMessages,
    assistantMessages,
    tools,
    moments,
  };
}

function computeStats(sessions: Session[]): BuildStats {
  let totalMoments = 0;
  let decisions = 0;
  let pivots = 0;
  let emotions = 0;
  let directives = 0;
  let questions = 0;

  const toolCounts = new Map<string, number>();

  for (const session of sessions) {
    for (const moment of session.moments) {
      totalMoments++;
      switch (moment.type) {
        case "DECISION":
          decisions++;
          break;
        case "PIVOT":
          pivots++;
          break;
        case "EMOTION":
          emotions++;
          break;
        case "DIRECTIVE":
          directives++;
          break;
        case "QUESTION":
          questions++;
          break;
      }
    }

    for (const tool of session.tools) {
      toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1);
    }
  }

  const topTools = [...toolCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const dates = sessions
    .map((s) => s.date)
    .filter((d) => d !== "unknown")
    .sort();

  return {
    totalSessions: sessions.length,
    totalMoments,
    decisions,
    pivots,
    emotions,
    directives,
    questions,
    topTools,
    dateRange: {
      from: dates[0] ?? "unknown",
      to: dates[dates.length - 1] ?? "unknown",
    },
  };
}

export function extractBuildLog(
  parsedSessions: ParsedSession[],
  projectPath: string,
): BuildLog {
  const sessions = parsedSessions.map(extractSession);
  const stats = computeStats(sessions);

  return {
    projectPath,
    generatedAt: new Date().toISOString(),
    stats,
    sessions,
  };
}
