"use client";

import { ThreadNode } from "@/components/landing/thread-line";
import { clipRevealItem, clipRevealStagger, viewportFadeIn } from "@/lib/motion";
import { motion } from "framer-motion";

const beats = [
  {
    text: "You vibe coded for weeks. Dozens of sessions. Decisions that shaped the whole project. A pivot that saved it.",
    muted: false,
  },
  {
    text: "Then someone asks what you built. Or you decide it\u2019s time to post a thread. You open the editor and\u2026nothing. The story is gone. It\u2019s buried in .claude/projects/ across 45 session files you\u2019ll never reopen.",
    muted: true,
  },
  {
    text: "The gap between building and sharing shouldn\u2019t be this wide.",
    muted: false,
  },
];

export function BuildGap() {
  return (
    <section className="relative px-6 py-20">
      <ThreadNode />

      <div className="ml-0 md:ml-24 lg:ml-32 max-w-2xl">
        <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
          The Gap
        </div>

        <motion.h2
          className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl text-text leading-[1.1] tracking-[-0.01em] mb-10 texture-ink-bleed"
          {...viewportFadeIn(0)}
        >
          You built something worth sharing.
          <br />
          Then you opened a blank editor.
        </motion.h2>

        <motion.div
          className="space-y-5"
          variants={clipRevealStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {beats.map((beat, i) => (
            <motion.p
              key={i}
              className={`font-[family-name:var(--font-serif)] text-sm leading-relaxed ${
                beat.muted ? "text-text-muted" : "text-text"
              }`}
              variants={clipRevealItem}
            >
              {beat.text}
            </motion.p>
          ))}
        </motion.div>

        {/* Stat line */}
        <motion.div className="mt-10 font-mono text-xs text-text-dim" {...viewportFadeIn(0.6)}>
          45 sessions &middot; 87 moments &middot;{" "}
          <span className="text-accent-amber">0 posts written</span>
        </motion.div>
      </div>
    </section>
  );
}
