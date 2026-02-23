import type { Variants } from "framer-motion";

// Timing
export const DURATION = { fast: 0.15, normal: 0.2, slow: 0.4 } as const;

// Easing
export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

// Basic presets
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function viewportFadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: DURATION.slow, delay },
  };
}

// Dropdown menu
export const dropdownMenu = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: DURATION.fast, ease: EASE.out },
};

// Premium presets (clipPath reveals, scan effects)
export const scanLine: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export const clipRevealStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export const clipRevealItem: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)", opacity: 0 },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

// Ghost card dealing effect — slower stagger for dramatic pacing
export const ghostCardStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

export const ghostCardItem: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)", opacity: 0, y: 30 },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

// Thread line growing downward on load
export const threadProgress: Variants = {
  hidden: { scaleY: 0, originY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 2, ease: [0.16, 1, 0.3, 1] },
  },
};

// Asymmetric drift-in from right side
export function driftIn(delay = 0, x = 60) {
  return {
    initial: { opacity: 0, x },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  };
}

// Wax seal stamp pressing into view with overshoot
export const stampReveal = {
  initial: { opacity: 0, scale: 1.6, rotate: -12 },
  whileInView: { opacity: 1, scale: 1, rotate: -3 },
  viewport: { once: true },
  transition: {
    duration: 0.6,
    ease: [0.34, 1.56, 0.64, 1] as const,
  },
};
