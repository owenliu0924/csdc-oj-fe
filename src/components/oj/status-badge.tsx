"use client";

import { motion, useReducedMotion } from "motion/react";
import { JUDGE_STATUS, JUDGE_STATUS_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { springSnappy } from "@/lib/motion";

export function StatusBadge({
  status,
  className,
}: {
  status: number | string;
  className?: string;
}) {
  const t = useTranslations("m");
  const reduce = useReducedMotion();
  const info = JUDGE_STATUS[String(status)] || {
    name: String(status),
    color: "blue",
  };
  const key = info.name.replace(/ /g, "_");
  let label = info.name;
  try {
    label = t(key as "Accepted");
  } catch {
    label = info.name;
  }

  const classes = cn(
    "inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide backdrop-blur-sm",
    JUDGE_STATUS_COLOR[info.color] || JUDGE_STATUS_COLOR.blue,
    className
  );

  if (reduce) {
    return <span className={classes}>{label}</span>;

  }

  return (
    <motion.span
      key={String(status)}
      className={classes}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springSnappy}
    >
      {label}
    </motion.span>

  );
}
