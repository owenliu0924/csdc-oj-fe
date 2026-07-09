"use client";

import { Inbox } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springSoft } from "@/lib/motion";

export function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 py-16 text-[var(--muted)]",
        className
      )}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springSoft}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ ...springSoft, delay: 0.08 }}
      >
        <Inbox className="h-6 w-6" strokeWidth={1.5} />
      </motion.div>

      <motion.p
        className="text-sm"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        {message}
      </motion.p>

    </motion.div>

  );
}
