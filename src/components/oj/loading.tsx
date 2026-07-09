"use client";

import { Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Loading({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("flex items-center justify-center py-20", className)}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : { duration: 0.85, repeat: Infinity, ease: "linear" }
        }
      >
        <Loader2 className="h-5 w-5 text-[var(--pink)]" />
      </motion.div>

    </motion.div>

  );
}
