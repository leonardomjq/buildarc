"use client";

import { ThreadNode } from "@/components/landing/thread-line";
import { clipRevealItem, clipRevealStagger, driftIn, viewportFadeIn } from "@/lib/motion";
import { motion } from "framer-motion";

const rawSessionCards = [
  "Session #12 — Auth debugging",
  "Session #23 — API pivot",
  "Session #38 — Deploy fix",
];

export function OriginCaseStudy() {
  return (
    <section className="relative px-6 py-20">
      <ThreadNode />

      <div className="ml-0 md:ml-24 lg:ml-32 max-w-5xl">
        <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
          Origin Story
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 mt-8">
          {/* Left: Narrative */}
          <motion.div className="space-y-5" {...viewportFadeIn(0)}>
            <p className="font-[family-name:var(--font-serif)] text-text text-sm leading-relaxed">
              I spent six weeks building ScoutAgent with Claude Code. Forty-five sessions. When I
              tried to write a build-in-public thread, I realized the story had vanished &mdash;
              buried in thousands of lines of tool calls and progress events inside{" "}
              <code className="font-mono text-xs text-accent-green bg-surface-elevated px-1.5 py-0.5 rounded">
                .claude/projects/
              </code>
              .
            </p>
            <p className="font-[family-name:var(--font-serif)] text-text text-sm leading-relaxed">
              So I built buildarc. One command to turn those sessions into something I could
              actually post. The ScoutAgent thread was its first output.
            </p>
          </motion.div>

          {/* Right: Visual data pile */}
          <div className="space-y-8">
            {/* Scattered raw session cards */}
            <motion.div
              className="space-y-2"
              variants={clipRevealStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {rawSessionCards.map((session, i) => (
                <motion.div
                  key={i}
                  className="font-mono text-[10px] text-text-dim bg-surface border border-border rounded px-3 py-1.5 truncate"
                  variants={clipRevealItem}
                  style={{
                    transform: `translateX(${(i % 3) * 8 - 8}px)`,
                  }}
                >
                  {session}
                </motion.div>
              ))}
            </motion.div>

            {/* Arrow down */}
            <motion.div className="flex justify-center text-text-dim" {...viewportFadeIn(0.6)}>
              <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
                <path
                  d="M12 0 V32 M6 26 L12 34 L18 26"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="5 3 2 4"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Clean output card */}
            <motion.div
              className="bg-surface texture-paper border-l-[3px] border-l-accent-green/50 border border-border rounded-lg p-4 shadow-elevated"
              {...driftIn(0.8, 40)}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent-green mb-2">
                Output
              </div>
              <p className="font-mono text-xs text-text leading-relaxed">
                4-tweet thread covering 6 weeks, 87 key moments, and the pivot that saved the
                project.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
