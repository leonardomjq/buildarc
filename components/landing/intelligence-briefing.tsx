"use client";

import { motion } from "framer-motion";
import { clipRevealStagger, clipRevealItem, scanLine } from "@/lib/motion";
import { SectionCta } from "@/components/landing/section-cta";

export function IntelligenceBriefing() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center px-6 py-20 overflow-hidden">
      <motion.div
        className="max-w-4xl"
        variants={clipRevealStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={clipRevealItem}>
          <motion.div
            className="h-px bg-accent-green mb-8 w-24"
            variants={scanLine}
          />
        </motion.div>

        <motion.h1
          className="font-[family-name:var(--font-display)] text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold leading-[1] tracking-tight text-text"
          variants={clipRevealItem}
        >
          Know what to build.
          <br />
          <span className="text-accent-green">72 hours</span> before
          <br />
          everyone else.
        </motion.h1>

        <motion.p
          className="font-[family-name:var(--font-serif)] text-text-muted text-base sm:text-lg mt-8 max-w-2xl leading-relaxed"
          variants={clipRevealItem}
        >
          ScoutAgent scans thousands of conversations across Twitter, GitHub,
          HN, and Reddit&mdash;then delivers opportunity briefs so you can ship
          the right thing first.
        </motion.p>

        <motion.div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6" variants={clipRevealItem}>
          <SectionCta text="Start Free — No Credit Card" />
        </motion.div>

        <motion.p
          className="mt-6 font-mono text-xs text-text-dim"
          variants={clipRevealItem}
        >
          12,000+ market signals analyzed weekly
        </motion.p>
      </motion.div>
    </section>
  );
}
