// ── Raw transcript event types ──────────────────────────────────────

export interface ContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  name?: string;
  id?: string;
  input?: unknown;
}

export interface RawUserEvent {
  type: "user";
  sessionId: string;
  slug?: string;
  timestamp: string;
  cwd?: string;
  gitBranch?: string;
  parentUuid?: string | null;
  isSidechain?: boolean;
  message: {
    role: "user";
    content: string;
  };
}

export interface RawAssistantEvent {
  type: "assistant";
  sessionId: string;
  slug?: string;
  timestamp: string;
  cwd?: string;
  gitBranch?: string;
  parentUuid?: string | null;
  isSidechain?: boolean;
  message: {
    role: "assistant";
    model?: string;
    content: ContentBlock[];
    stop_reason?: string | null;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
}

export type RawEvent = RawUserEvent | RawAssistantEvent;

// ── Parsed types ────────────────────────────────────────────────────

export interface ParsedUserMessage {
  role: "user";
  text: string;
  timestamp: string;
}

export interface ParsedAssistantMessage {
  role: "assistant";
  text: string;
  tools: string[];
  timestamp: string;
}

export type ParsedMessage = ParsedUserMessage | ParsedAssistantMessage;

export interface ParsedSession {
  sessionId: string;
  slug: string;
  startedAt: string;
  endedAt: string;
  messages: ParsedMessage[];
}

// ── Extracted types ─────────────────────────────────────────────────

export type MomentType = "DECISION" | "PIVOT" | "EMOTION" | "DIRECTIVE" | "QUESTION";

export interface Moment {
  type: MomentType;
  text: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface Session {
  sessionId: string;
  slug: string;
  date: string;
  startedAt: string;
  endedAt: string;
  userMessages: number;
  assistantMessages: number;
  tools: string[];
  moments: Moment[];
}

export interface BuildStats {
  totalSessions: number;
  totalMoments: number;
  decisions: number;
  pivots: number;
  emotions: number;
  directives: number;
  questions: number;
  topTools: Array<{ name: string; count: number }>;
  dateRange: { from: string; to: string };
}

export interface BuildLog {
  projectPath: string;
  generatedAt: string;
  stats: BuildStats;
  sessions: Session[];
}

// ── CLI types ───────────────────────────────────────────────────────

export type OutputFormat = "md" | "json";

export type ContentFormat = "tweet" | "linkedin" | "journal";

export interface CliOptions {
  projectPath: string | null;
  format: OutputFormat;
  since: string | null;
  sessions: number | null;
  output: string | null;
  quiet: boolean;
  noAi: boolean;
  contentFormats: ContentFormat[];
  style: string | null;
  help: boolean;
  version: boolean;
}

export interface ProjectContext {
  name: string | null;
  description: string | null;
  repoUrl: string | null;
  homepageUrl: string | null;
  installCommand: string | null;
}
