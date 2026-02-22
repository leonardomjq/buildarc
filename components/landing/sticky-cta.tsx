"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop: top bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-overlay hidden md:flex items-center justify-between px-6 py-3 bg-surface/80 backdrop-blur-md border-b border-text-dim/20"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-text">
              Scout<span className="text-text-dim">Agent</span>
            </span>
            <Link
              href="/signup"
              className="font-mono text-xs font-medium bg-accent-green text-[#0A0A0A] px-4 py-1.5 rounded hover:opacity-90 transition-opacity"
            >
              Start Free
            </Link>
          </motion.div>

          {/* Mobile: bottom-right pill */}
          <motion.div
            className="fixed bottom-6 right-6 z-overlay md:hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/signup"
              className="font-mono text-xs font-medium bg-accent-green text-[#0A0A0A] px-5 py-2.5 rounded-full shadow-elevated hover:opacity-90 transition-opacity"
            >
              Start Free
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
