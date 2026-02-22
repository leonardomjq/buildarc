"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";
import { SectionCta } from "@/components/landing/section-cta";

const rows = [
  {
    without: "Doom-scrolling Twitter, HN, and Reddit hoping to spot an idea",
    withSA: "24/7 scanning across every platform founders actually watch",
  },
  {
    without: "Hearing about hot markets after someone already shipped",
    withSA: "Opportunity detection within 72 hours of first demand signals",
  },
  {
    without: "Betting your next 3 months on a gut feeling",
    withSA: "Evidence-backed briefs with real demand data, not speculation",
  },
  {
    without: "Watching competitors launch what you were \u2018thinking about\u2019",
    withSA: "Actionable opportunities delivered while others drown in noise",
  },
];

export function ProblemAgitation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
        The Problem
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-12">
        You&apos;re flying blind
      </h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
        variants={clipRevealStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Without column */}
        <motion.div className="space-y-4" variants={clipRevealItem}>
          <div className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
            Without ScoutAgent
          </div>
          {rows.map((row) => (
            <div
              key={row.without}
              className="flex items-start gap-3 text-sm"
            >
              <X className="size-4 text-text-dim/50 shrink-0 mt-0.5" />
              <span className="font-[family-name:var(--font-serif)] text-text-dim">
                {row.without}
              </span>
            </div>
          ))}
        </motion.div>

        {/* With column */}
        <motion.div className="space-y-4" variants={clipRevealItem}>
          <div className="font-mono text-xs uppercase tracking-widest text-accent-green mb-4">
            With ScoutAgent
          </div>
          {rows.map((row) => (
            <div
              key={row.withSA}
              className="flex items-start gap-3 text-sm"
            >
              <Check className="size-4 text-accent-green shrink-0 mt-0.5" />
              <span className="font-[family-name:var(--font-serif)] text-text">
                {row.withSA}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="mt-12">
        <SectionCta text="See what you're missing" variant="secondary" />
      </div>
    </section>
  );
}
