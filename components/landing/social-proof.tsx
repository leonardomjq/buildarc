"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";

const audiences = [
  "Indie Hackers",
  "Solo Founders",
  "Micro-SaaS Builders",
  "Early-Stage VCs",
];

const sources = ["Twitter / X", "GitHub", "Hacker News", "Reddit"];

export function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        className="text-center"
        variants={clipRevealStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Built For */}
        <motion.div variants={clipRevealItem}>
          <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">
            Built For
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="font-mono text-xs border border-text-dim/30 text-text rounded-full px-4 py-1.5"
              >
                {audience}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Source Platforms */}
        <motion.div variants={clipRevealItem}>
          <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">
            Scanning opportunities across
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {sources.map((source) => (
              <span
                key={source}
                className="font-mono text-sm text-text-muted"
              >
                {source}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
