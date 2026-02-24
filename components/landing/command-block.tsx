"use client";

import { CopyCommand } from "@/components/landing/copy-command";
import { stampReveal, viewportFadeIn } from "@/lib/motion";
import { motion } from "framer-motion";
import { Github } from "lucide-react";

export function CommandBlock() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <motion.div {...viewportFadeIn(0)}>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl text-text leading-[1.1] tracking-[-0.01em] texture-ink-bleed mb-3">
            Your build story is already written.
          </h2>
          <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm sm:text-base">
            It&apos;s in your session files. One command to get it out.
          </p>
        </motion.div>

        {/* Enlarged CopyCommand with glow */}
        <motion.div className="flex justify-center" {...viewportFadeIn(0.2)}>
          <div className="shadow-glow rounded-lg">
            <CopyCommand />
          </div>
        </motion.div>

        {/* Runs Locally stamp */}
        <motion.div className="flex justify-center" {...stampReveal}>
          <span className="stamp-seal text-accent-green">Runs Locally</span>
        </motion.div>

        {/* Secondary links */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          {...viewportFadeIn(0.4)}
        >
          <a
            href="https://github.com/leonardomjq/buildarc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm text-text-muted hover:text-text transition-colors"
          >
            <Github className="size-4" />
            View on GitHub
          </a>
          <span className="text-text-dim hidden sm:inline">&middot;</span>
          <span className="font-mono text-xs text-text-dim">
            Free and open source. MIT licensed.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
