"use client";

import { useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { sanitizeHtml } from "@/lib/sanitize";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

const KATEX_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "$", right: "$", display: false },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false },
];

function renderLatex(el: HTMLElement | null) {
  if (!el) return;
  try {
    renderMathInElement(el, {
      delimiters: KATEX_DELIMITERS,
      throwOnError: false,
      errorColor: "#cc0000",
      ignoredTags: [
        "script",
        "noscript",
        "style",
        "textarea",
        "pre",
        "code",
        "kbd",
        "samp",
      ],
    });
  } catch {
    // ignore formula errors
  }
}

export function MarkdownView({
  content,
  className,
}: {
  content?: string | null;
  className?: string;
}) {
  if (!content) return null;
  return (
    <div className={cn("markdown-body", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                "*": ["className", "style"],
              },
            },
          ],
          rehypeKatex,
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function HtmlContent({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html) return null;

  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  if (!looksHtml) {
    return <MarkdownView content={html} className={className} />;
  }

  return <HtmlWithKatex html={html} className={className} />;
}


function HtmlWithKatex({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const appliedHtml = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (appliedHtml.current !== html) {
      el.innerHTML = sanitizeHtml(html);
      appliedHtml.current = html;
      renderLatex(el);
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className={cn("markdown-body", className)}
      suppressHydrationWarning
    />
  );
}
