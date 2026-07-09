import type { Transition, Variants } from "motion/react";

export const springSoft: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.7,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

export const easeOutExpo: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

export const fadeTransition: Transition = {
  duration: 0.35,
  ease: easeOutExpo,
};

export const pageTransition: Transition = {
  duration: 0.42,
  ease: easeOutExpo,
};

export const pageVariants: Variants = {
  initial: { y: 10 },
  animate: {
    y: 0,
    transition: pageTransition,
  },
  exit: {
    y: -6,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: fadeTransition,
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.18 },
  },
};

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.16 },
  },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.28 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  initial: { y: 8 },
  animate: {
    y: 0,
    transition: fadeTransition,
  },
};

export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -12, height: 0 },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    y: -8,
    height: 0,
    transition: { duration: 0.2 },
  },
};

export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.2 },
  },
};

export const navBarVariants: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...springGentle, delay: 0.05 },
  },
};

export const cardHover = {
  y: -2,
  transition: springSnappy,
};

export const cardTap = {
  scale: 0.995,
  transition: springSnappy,
};

export const buttonTap = { scale: 0.97 };
export const buttonHover = { scale: 1.02 };
