"use client";

import { CopyCommand } from "@/components/landing/copy-command";
import { ThreadNode } from "@/components/landing/thread-line";
import { motion } from "framer-motion";

export function GhostThreadHero() {
  return (
    <section
      id="hero"
      className="relative px-6 min-h-[calc(100svh-3rem)] flex flex-col justify-center"
    >
      <ThreadNode />

      <div className="max-w-3xl ml-0 md:ml-24 lg:ml-32">
        {/* Marginalia */}
        <motion.div
          className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          CLI Tool &middot; Open Source &middot; Nothing to Configure
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-[family-name:var(--font-display)] text-[3rem] sm:text-[4.5rem] md:text-[7rem] text-text leading-[1.05] tracking-[-0.02em] mb-8 texture-ink-bleed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your build story,
          <br />
          recovered.
        </motion.h1>

        {/* One sentence that grounds the promise */}
        <motion.p
          className="font-[family-name:var(--font-serif)] text-text-muted text-lg sm:text-xl max-w-xl leading-relaxed mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          One command turns your Claude Code sessions into content you can actually post.
        </motion.p>

        {/* The answer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <CopyCommand />
        </motion.div>
      </div>
    </section>
  );
}
