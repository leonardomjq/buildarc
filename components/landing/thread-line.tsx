"use client";

import type { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { threadProgress } from "@/lib/motion";

interface ThreadLineProps {
  children: ReactNode;
}

export function ThreadLine({ children }: ThreadLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <div ref={ref} className="relative">
      {/* The vertical thread line */}
      <motion.div
        className="absolute top-0 bottom-0 left-8 md:left-16 lg:left-24 w-px bg-accent-green/15 hidden md:block"
        variants={threadProgress}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      />
      {children}
    </div>
  );
}

export function ThreadNode() {
  return (
    <div className="absolute left-8 md:left-16 lg:left-24 -translate-x-1/2 hidden md:block">
      <div className="size-2 rounded-full bg-accent-green/30 ring-2 ring-accent-green/10" />
    </div>
  );
}
