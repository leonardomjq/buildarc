"use client";

import { ThreadNode } from "@/components/landing/thread-line";
import { DURATION, EASE, viewportFadeIn } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type TabId = "tweet" | "linkedin" | "journal";

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: "tweet", label: "Tweet Thread" },
  { id: "linkedin", label: "LinkedIn Post" },
  { id: "journal", label: "Build Journal" },
];

const tagColor: Record<string, string> = {
  "[DECISION]": "text-accent-blue",
  "[PIVOT]": "text-accent-amber",
  "[EMOTION]": "text-accent-orange",
  "[DIRECTIVE]": "text-text-muted",
};

function colorTags(text: string) {
  const parts = text.split(/(\[[A-Z]+\])/g);
  return parts.map((part, i) => {
    const color = tagColor[part];
    if (color) {
      return (
        <span key={i} className={color}>
          {part}
        </span>
      );
    }
    return part;
  });
}

/* ── Tweet Thread content ── */
function TweetContent() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="size-8 rounded-full bg-text-dim/20" />
        <div>
          <div className="font-mono text-xs text-text">@yourhandle</div>
          <div className="font-mono text-[10px] text-text-dim">Thread</div>
        </div>
      </div>
      {[
        "1/ Built a SaaS with Claude Code over 6 weeks. 45 sessions. Here\u2019s how it went \u2014 the decisions, the pivots, and the moment that almost killed it.",
        "2/ Week 1\u20132: Setup and architecture\n\u2192 [DECISION] Cookie-based sessions, not JWT\n\u2192 [DECISION] Postgres over MongoDB\n\u2192 Felt fast. Everything worked on the first try.",
        "3/ Week 3: The pivot\n\u2192 Twitter API costs $200/mo for signal collection\n\u2192 [PIVOT] Switched to free sources (HN, Reddit, GitHub)\n\u2192 Got 250 signals per run for $0",
        '4/ Week 6: Ship it\n\u2192 [EMOTION] "The story was disappearing between sessions"\n\u2192 That realization became buildarc\n\u2192 One command to recover the build story',
      ].map((tweet, i) => (
        <div key={i} className="font-mono text-xs text-text leading-relaxed whitespace-pre-line">
          {colorTags(tweet)}
        </div>
      ))}
    </div>
  );
}

/* ── LinkedIn content ── */
function LinkedInContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="size-8 rounded-full bg-text-dim/20" />
        <div>
          <div className="font-mono text-xs text-text">Your Name</div>
          <div className="font-mono text-[10px] text-text-dim">
            Builder &middot; Shipping in public
          </div>
        </div>
      </div>
      <div className="font-[family-name:var(--font-serif)] text-sm text-text leading-relaxed space-y-3">
        <p>
          I spent 6 weeks building a SaaS with Claude Code. 45 sessions. When it came time to share
          the story, I realized it had vanished.
        </p>
        <p className="text-text-muted">
          The interesting parts &mdash; a{" "}
          <span className="font-mono text-xs text-accent-amber">[PIVOT]</span> that saved $200/mo,
          the <span className="font-mono text-xs text-accent-blue">[DECISION]</span> to choose
          Postgres over MongoDB, the{" "}
          <span className="font-mono text-xs text-accent-orange">[EMOTION]</span> that sparked a new
          tool &mdash; were buried in thousands of lines of tool calls.
        </p>
        <p>
          So I built buildarc. One command to turn AI coding sessions into content you can actually
          post.
        </p>
        <p className="text-text-dim text-xs font-mono">#buildinpublic #claudecode #devtools #ai</p>
      </div>
    </div>
  );
}

/* ── Build Journal content ── */
function JournalContent() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          <div className="size-1.5 rounded-full bg-accent-green/50" />
          <div className="size-1.5 rounded-full bg-accent-amber/50" />
          <div className="size-1.5 rounded-full bg-accent-blue/50" />
        </div>
        <span className="font-mono text-[10px] text-text-dim">BUILDLOG.md</span>
      </div>
      <div className="font-mono text-xs text-text leading-relaxed space-y-3">
        <div>
          <span className="text-text-dim">## Session 23 &mdash; Week 3</span>
        </div>
        <div>
          <span className="text-accent-amber">[PIVOT]</span>{" "}
          <span className="text-text">
            Twitter API pricing killed the original plan. Switched to HN + Reddit + GitHub trending
            as signal sources.
          </span>
        </div>
        <div>
          <span className="text-accent-blue">[DECISION]</span>{" "}
          <span className="text-text">
            Cron-based collection every 6 hours instead of real-time streaming.
          </span>
        </div>
        <div className="text-text-dim">&mdash;&mdash;&mdash;</div>
        <div>
          <span className="text-text-dim">## Session 38 &mdash; Week 5</span>
        </div>
        <div>
          <span className="text-accent-orange">[EMOTION]</span>{" "}
          <span className="text-text-muted">
            &quot;The story was disappearing between sessions. I couldn&apos;t reconstruct the
            journey.&quot;
          </span>
        </div>
        <div>
          <span className="text-accent-blue">[DECISION]</span>{" "}
          <span className="text-text">Started building buildarc to solve this exact problem.</span>
        </div>
      </div>
    </div>
  );
}

const contentMap: Record<TabId, () => React.JSX.Element> = {
  tweet: TweetContent,
  linkedin: LinkedInContent,
  journal: JournalContent,
};

export function OutputShowcase() {
  const [active, setActive] = useState<TabId>("tweet");
  const Content = contentMap[active];

  return (
    <section className="relative px-6 py-20">
      <ThreadNode />

      <div className="ml-0 md:ml-24 lg:ml-32 max-w-4xl">
        <motion.div {...viewportFadeIn(0)}>
          <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
            What You Get
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl text-text leading-[1.1] tracking-[-0.01em] mb-2">
            Content you can actually post.
          </h2>
          <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-8">
            Same build story. Three formats. Ready in seconds.
          </p>
        </motion.div>

        <motion.div {...viewportFadeIn(0.15)}>
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2 font-mono text-xs transition-colors relative -mb-px ${
                  active === tab.id
                    ? "bg-surface text-text border border-border border-b-surface rounded-t-lg"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content card */}
          <div className="bg-surface texture-paper border border-border border-t-0 rounded-b-lg p-6 shadow-elevated min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: DURATION.fast, ease: [...EASE.out] }}
              >
                <Content />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mechanism note */}
        <motion.div className="mt-6 font-mono text-xs text-text-dim" {...viewportFadeIn(0.3)}>
          One command. 45 sessions &rarr; 4-tweet thread in 3 seconds.
        </motion.div>
      </div>
    </section>
  );
}
