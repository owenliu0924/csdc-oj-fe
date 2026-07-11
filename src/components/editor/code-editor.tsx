"use client";

import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function getMonacoLanguage(language: string) {
  const l = language.toLowerCase();
  if (l.includes("c++") || l.includes("cpp")) return "cpp";
  if (l.includes("c#") || l.includes("csharp")) return "csharp";
  if (l.includes("java") && !l.includes("javascript")) return "java";
  if (l.includes("python")) return "python";
  if (l.includes("javascript") || l.includes("node")) return "javascript";
  if (l.includes("go")) return "go";
  if (l.includes("rust")) return "rust";
  if (l.includes("c")) return "c";
  return "plaintext";
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  language: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  onReset?: () => void;
  className?: string;
};

export function CodeEditor({
  value,
  onChange,
  language,
  languages,
  onLanguageChange,
  onReset,
  className,
}: Props) {
  const t = useTranslations("m");
  const fileRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="flex-none flex flex-wrap items-center gap-2">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("Language")} />
          </SelectTrigger>

          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onReset && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            {t("Reset_to_default_code_definition")}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {t("Upload_file")}
        </Button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => onChange(String(reader.result || ""));
            reader.readAsText(f);
          }}
        />
      </div>

      <div className="flex-1 min-h-[360px] overflow-hidden rounded-2xl border border-[var(--glass-border)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          value={value}
          onChange={(val) => onChange(val || "")}
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          loading={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading Editor...</div>}
        />
      </div>
    </div>
  );
}
