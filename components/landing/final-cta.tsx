"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";
import { SectionCta } from "@/components/landing/section-cta";

export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto text-center" ref={ref}>
      <motion.div
        variants={clipRevealStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.h2
          className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-4"
          variants={clipRevealItem}
        >
          Stop scrolling for ideas. Start receiving them.
        </motion.h2>

        <motion.p
          className="font-[family-name:var(--font-serif)] text-text-muted text-sm sm:text-base mb-8"
          variants={clipRevealItem}
        >
          Join founders who discover what to build next — before the market catches on.
        </motion.p>

        <motion.div variants={clipRevealItem}>
          <SectionCta text="Start Free" />
        </motion.div>

        <motion.p
          className="font-mono text-xs text-text-dim mt-4"
          variants={clipRevealItem}
        >
          No credit card required.
        </motion.p>
      </motion.div>
    </section>
  );
}
