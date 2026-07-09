"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

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
        remarkPlugins={[remarkGfm]}
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

  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  if (!looksHtml) {
    return <MarkdownView content={html} className={className} />;
  }
  return (
    <div
      className={cn("markdown-body", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
