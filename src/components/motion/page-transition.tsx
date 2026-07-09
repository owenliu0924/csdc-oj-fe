"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { pageTransition } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
