"use client";

import { motion, useReducedMotion } from "motion/react";
import { useWebsiteStore } from "@/stores/website";
import { fadeTransition } from "@/lib/motion";
import DOMPurify from "isomorphic-dompurify";

const GITHUB_URL = "https://github.com/owenliu0924/csdc-oj-fe";

export function Footer() {
  const website = useWebsiteStore((s) => s.website);
  const reduce = useReducedMotion();

  return (
    <motion.footer
      className="mt-auto px-4 py-12 text-center text-xs text-[var(--faint)]"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...fadeTransition, delay: 0.15 }}
    >
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {website.website_footer ? (
          <div
            className="prose prose-invert prose-sm text-[var(--faint)]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(website.website_footer) }}
          />
        ) : (
          <span className="tracking-wide">
            {website.website_name || "CSDC OJ"}
          </span>
        )}
        <span aria-hidden>|</span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="tracking-wide transition-colors hover:text-[var(--pink-bright)]"
        >
          Github
        </a>
      </div>
    </motion.footer>
  );
}
