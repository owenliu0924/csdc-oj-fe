"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Loading } from "@/components/oj/loading";
import ojApi from "@/lib/api/oj";
import { storage } from "@/lib/storage";
import { STORAGE_KEY } from "@/lib/constants";

type Language = {
  name: string;
  description?: string;
  content_type?: string;
  config?: {
    compile?: {
      compile_command?: string;
      src_name?: string;
      exe_name?: string;
    };
    run?: {
      command?: string;
    };
  };
};

function normalizeLanguages(data: unknown): Language[] {
  if (Array.isArray(data)) return data as Language[];
  if (data && typeof data === "object") {
    const d = data as { languages?: Language[] };
    if (Array.isArray(d.languages)) return d.languages;
  }
  return [];
}

export default function AboutPage() {
  const t = useTranslations("m");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = storage.get<Language[] | { languages: Language[] }>(
      STORAGE_KEY.languages
    );
    if (cached) {
      const list = normalizeLanguages(cached);
      if (list.length) {
        setLanguages(list);
        setLoading(false);
      }
    }
    ojApi
      .getLanguages()
      .then((res) => {
        const list = normalizeLanguages(res.data.data);
        setLanguages(list);
        storage.set(STORAGE_KEY.languages, list);
      })
      .finally(() => setLoading(false));
  }, []);

  const results = [
    { key: "Pending_Judging_Description", title: `${t("Pending")} & ${t("Judging")}` },
    { key: "Compile_Error_Description", title: t("Compile_Error") },
    { key: "Accepted_Description", title: t("Accepted") },
    { key: "Wrong_Answer_Description", title: t("Wrong_Answer") },
    { key: "Runtime_Error_Description", title: t("Runtime_Error") },
    {
      key: "Time_Limit_Exceeded_Description",
      title: t("Time_Limit_Exceeded"),
    },
    {
      key: "Memory_Limit_Exceeded_Description",
      title: t("Memory_Limit_Exceeded"),
    },
    { key: "System_Error_Description", title: t("System_Error") },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <GlassPanel title={`${t("Compiler")} & ${t("Judger")}`}>
        {loading ? (
          <Loading />
        ) : languages.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">—</p>
        ) : (
          <ul className="space-y-3">
            {languages.map((lang) => {
              const cmd = lang.config?.compile?.compile_command;
              return (
                <li
                  key={lang.name}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
                >
                  <div className="text-sm font-medium">
                    {lang.name}
                    {lang.description ? (
                      <span className="ml-1.5 font-normal text-[var(--muted)]">
                        ({lang.description})
                      </span>
                    ) : null}
                  </div>
                  {cmd ? (
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/5 bg-black/25 px-3 py-2 font-mono text-xs leading-relaxed text-[var(--fg-secondary)]">
                      {cmd}
                    </pre>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </GlassPanel>

      <GlassPanel title={t("Result_Explanation")}>
        <ul className="space-y-3.5">
          {results.map((r) => (
            <li key={r.key} className="text-sm leading-relaxed">
              <span className="font-medium text-[var(--fg-secondary)]">
                {r.title}
              </span>
              <span className="text-[var(--muted)]">
                {" "}
                : {t(r.key as "Accepted_Description")}
              </span>
            </li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
}
