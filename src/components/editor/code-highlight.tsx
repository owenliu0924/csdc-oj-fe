"use client";

import { useEffect, useState } from "react";
import hljs from "highlight.js/lib/core";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);

function mapLang(language?: string) {
  if (!language) return "cpp";
  const l = language.toLowerCase();
  if (l.includes("python")) return "python";
  if (l.includes("java")) return "java";
  if (l.includes("javascript") || l.includes("node")) return "javascript";
  if (l.includes("c++") || l.includes("cpp") || l.includes("g++")) return "cpp";
  if (l === "c" || l.includes("gcc")) return "c";
  return "cpp";
}

export function CodeHighlight({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    try {
      setHtml(hljs.highlight(code, { language: mapLang(language) }).value);
    } catch {
      setHtml(hljs.highlightAuto(code).value);
    }
  }, [code, language]);

  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm font-mono",
        className
      )}
    >
      <code
        className="hljs"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || code) }}
      />
    </pre>
  );
}
