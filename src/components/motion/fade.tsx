"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import {
  fadeUpVariants,
  staggerContainer,
  staggerFast,
  staggerItem,
  springSoft,
} from "@/lib/motion";

type FadeProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 12,
}: FadeProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;

  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>

  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  fast?: boolean;
  as?: "div" | "ul" | "ol" | "tbody";
};

export function Stagger({
  children,
  className,
  fast,
  as = "div",
}: StaggerProps) {
  const reduce = useReducedMotion();
  const variants: Variants = fast ? staggerFast : staggerContainer;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;

  }

  const Comp =
    as === "ul"
      ? motion.ul
      : as === "ol"
        ? motion.ol
        : as === "tbody"
          ? motion.tbody
          : motion.div;

  return (
    <Comp
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
    >
      {children}
    </Comp>

  );
}

type ItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "tr";
};

export function StaggerItem({
  children,
  className,
  as = "div",
}: ItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;

  }

  const Comp =
    as === "li" ? motion.li : as === "tr" ? motion.tr : motion.div;

  return (
    <Comp className={className} variants={staggerItem}>
      {children}
    </Comp>

  );
}

export function MotionPresence({
  children,
  className,
  variants = fadeUpVariants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springSoft}
    >
      {children}
    </motion.div>

  );
}

export type { HTMLMotionProps };
