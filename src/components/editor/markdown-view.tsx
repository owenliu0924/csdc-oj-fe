"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";

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
        rehypePlugins={[rehypeRaw, rehypeKatex]}
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

  return <MarkdownView content={html} className={className} />;
}
