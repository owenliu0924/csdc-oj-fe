"use client";

import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
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

function langExtension(language: string) {
  const l = language.toLowerCase();
  if (l.includes("python")) return python();
  if (l.includes("java")) return java();
  if (l.includes("javascript") || l.includes("node")) return javascript();
  return cpp();
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  language: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  onReset?: () => void;
};

export function CodeEditor({
  value,
  onChange,
  language,
  languages,
  onLanguageChange,
  onReset,
}: Props) {
  const t = useTranslations("m");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
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

      <div className="overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]">
        <CodeMirror
          value={value}
          height="360px"
          theme={oneDark}
          extensions={[langExtension(language), EditorView.lineWrapping]}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
          }}
        />
      </div>

    </div>

  );
}
