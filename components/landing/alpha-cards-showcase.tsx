"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock } from "lucide-react";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";
import { SectionCta } from "@/components/landing/section-cta";

const entities = ["Notion", "Linear", "Todoist", "solo founders"];

const evidence = [
  "340+ tweets in 7 days from solo founders saying Notion is \u2018overkill for task management\u2019 \u2014 up 280% from 30-day baseline.",
  "Three new micro-SaaS tools each hit 500+ signups in their first week targeting this exact pain point.",
];

const proFields = [
  "Friction Detail",
  "Gap Analysis",
  "Risk Factors",
  "Competitive Landscape",
  "Opportunity Playbook",
];

export function AlphaCardsShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
        What You Get
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-4">
        Alpha Cards
      </h2>
      <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-12 max-w-2xl">
        Actionable opportunity briefs — not dashboards, not alerts. Each card is
        a researched business opportunity with evidence, timing, and a strategy
        to act on it.
      </p>

      <motion.div
        className="max-w-3xl mx-auto"
        variants={clipRevealStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          className="texture-paper bg-surface border border-accent-green/30 rounded-lg overflow-hidden shadow-[0_0_40px_-10px_rgba(0,229,179,0.15)]"
          variants={clipRevealItem}
        >
          {/* Card header */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent-green border border-accent-green/30 rounded px-2 py-0.5">
                Friction Cluster
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">
                  Opportunity
                </span>
                <span className="font-mono text-lg font-bold text-accent-green">
                  87
                </span>
              </div>
            </div>

            <h3 className="font-[family-name:var(--font-serif)] text-xl text-text font-medium mb-3">
              Solopreneurs Are Rage-Quitting Notion for Task Management
            </h3>

            {/* Entity tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {entities.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-accent-green/70 border border-accent-green/20 rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Free-tier content: thesis + evidence */}
          <div className="px-6 pb-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
              Thesis
            </div>
            <p className="font-[family-name:var(--font-serif)] text-sm text-text leading-relaxed mb-5">
              Solo founders are loudly abandoning Notion for simple task management.
              They don&apos;t want databases, wikis, or AI features — they want a
              fast, opinionated to-do list that loads in under a second. Three new
              entrants validated demand this week with 500+ signups each. The gap: a
              $9/mo tool built specifically for solo operators who ship multiple
              projects.
            </p>

            <div className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
              Evidence
            </div>
            <ul className="space-y-2 mb-6">
              {evidence.map((item) => (
                <li
                  key={item}
                  className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed pl-3 border-l border-accent-green/30"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Blur gate — pro content */}
          <div className="relative border-t border-text-dim/20">
            <div className="blur-sm select-none pointer-events-none p-6" aria-hidden>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proFields.map((field) => (
                  <div key={field}>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
                      {field}
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-text-dim/20 rounded w-full" />
                      <div className="h-3 bg-text-dim/20 rounded w-4/5" />
                      <div className="h-3 bg-text-dim/20 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 font-mono text-sm text-accent-green bg-surface/90 border border-accent-green/30 rounded px-4 py-2">
                <Lock className="size-3.5" />
                Unlock with Pro
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <p className="text-center font-[family-name:var(--font-serif)] text-xs text-text-dim mt-6 max-w-lg mx-auto">
        Free users see titles, thesis, and key signals. Pro unlocks the full business strategy.
      </p>

      <div className="text-center mt-8">
        <SectionCta text="Get Opportunities Like This — Free" />
      </div>
    </section>
  );
}
