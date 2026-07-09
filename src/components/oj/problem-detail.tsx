"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel, GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/editor/code-editor";
import { HtmlContent } from "@/components/editor/markdown-view";
import { StatusBadge } from "@/components/oj/status-badge";
import { Loading } from "@/components/oj/loading";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { buildProblemCodeKey, JUDGE_STATUS } from "@/lib/constants";
import { storage } from "@/lib/storage";
import { useUserStore } from "@/stores/user";
import { useAuthModalStore } from "@/stores/auth-modal";
import { useContestStore } from "@/stores/contest";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { springSoft } from "@/lib/motion";
import { ProblemStatistic } from "@/components/oj/problem-statistic-dynamic";

type Problem = {
  id: number;
  _id: string;
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  samples: { input: string; output: string }[];
  hint?: string;
  source?: string;
  time_limit: number;
  memory_limit: number;
  difficulty: string;
  tags: string[];
  languages: string[];
  template?: Record<string, string>;
  my_status?: number;
  statistic_info?: Record<string, number>;
  accepted_number?: number;
  submission_number?: number;
  created_by?: { username: string };
  io_mode?: { io_mode: string; input?: string; output?: string };
  spj?: boolean;
};

type Props = {
  problemID: string;
  contestID?: string;
};

export function ProblemDetail({ problemID, contestID }: Props) {
  const t = useTranslations("m");
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const openAuth = useAuthModalStore((s) => s.open);
  const problemSubmitDisabled = useContestStore((s) => s.problemSubmitDisabled);
  const oiRealtime = useContestStore((s) => s.oiRealtimePermission);
  const contestStatusEnded =
    useContestStore((s) => s.contestStatus)() === "-1";

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [submissionExists, setSubmissionExists] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const storageKey = buildProblemCodeKey(problemID, contestID || null);

  const loadProblem = useCallback(async () => {
    setLoading(true);
    try {
      const res = contestID
        ? await ojApi.getContestProblem(problemID, contestID)
        : await ojApi.getProblem(problemID);
      const p = res.data.data as Problem;
      setProblem(p);
      const langs = p.languages || [];
      const saved = storage.get<{ code?: string; language?: string }>(storageKey);
      const lang = saved?.language || langs[0] || "C++";
      setLanguage(lang);
      if (saved && typeof saved === "object" && saved.code) {
        setCode(saved.code);
      } else if (p.template?.[lang]) {
        setCode(p.template[lang]);
      } else {
        setCode("");
      }
      if (contestID && isAuth()) {
        try {
          const ex = await ojApi.submissionExists(p.id);
          setSubmissionExists(!!ex.data.data);
        } catch {

        }
      }
    } finally {
      setLoading(false);
    }
  }, [problemID, contestID, storageKey, isAuth]);

  useEffect(() => {
    loadProblem();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadProblem]);

  useEffect(() => {
    if (!problem) return;
    storage.set(storageKey, { code, language });
  }, [code, language, problem, storageKey]);

  const pollStatus = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await ojApi.getSubmission(id);
        const sub = res.data.data as { result: number };
        if (![6, 7, 9].includes(sub.result)) {
          setResult(sub.result);
          if (pollRef.current) clearInterval(pollRef.current);
          setSubmitting(false);
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
        setSubmitting(false);
      }
    }, 1500);
  };

  const submit = async () => {
    if (!isAuth()) {
      openAuth("login");
      return;
    }
    if (!code.trim()) {
      toast.error(t("Code_can_not_be_empty"));
      return;
    }
    if (contestID && problemSubmitDisabled()) {
      toast.error(t("Contest_has_ended"));
      return;
    }
    if (contestID && submissionExists) {
      if (!window.confirm(t("You_have_submission_in_this_problem_sure_to_cover_it"))) {
        return;
      }
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await ojApi.submitCode({
        problem_id: problem!.id,
        language,
        code,
        contest_id: contestID || undefined,
      });
      const data = res.data.data as { submission_id: string };
      setSubmissionId(data.submission_id);
      toast.success(t("Submit_code_successfully"));
      if (contestID && !oiRealtime()) {
        setSubmitting(false);
        setSubmissionExists(true);
      } else {
        pollStatus(data.submission_id);
      }
    } catch {
      setSubmitting(false);
    }
  };

  const onReset = () => {
    if (!window.confirm(t("Are_you_sure_you_want_to_reset_your_code"))) return;
    const tmpl = problem?.template?.[language] || "";
    setCode(tmpl);
  };

  const onLangChange = (lang: string) => {
    setLanguage(lang);
    const saved = storage.get<{ code?: string }>(storageKey);
    if (!saved?.code && problem?.template?.[lang]) {
      setCode(problem.template[lang]);
    }
  };

  if (loading || !problem) return <Loading />;

  const statusInfo =
    result != null ? JUDGE_STATUS[String(result)] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <GlassPanel title={problem.title}>
          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                {t("Description")}
              </h3>

              <HtmlContent html={problem.description} />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                {t("Input")}
                {problem.io_mode?.io_mode === "File IO" &&
                  ` (${t("FromFile") || "From"}: ${problem.io_mode.input})`}
              </h3>

              <HtmlContent html={problem.input_description} />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                {t("Output")}
                {problem.io_mode?.io_mode === "File IO" &&
                  ` (${t("ToFile") || "To"}: ${problem.io_mode.output})`}
              </h3>

              <HtmlContent html={problem.output_description} />
            </section>

            {problem.samples?.map((s, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
                    <span>
                      {t("Sample_Input")} {i + 1}
                    </span>

                    <button
                      type="button"
                      className="hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(s.input);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                  </div>

                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {s.input}
                  </pre>

                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 text-xs font-semibold text-muted">
                    {t("Sample_Output")} {i + 1}
                  </div>

                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {s.output}
                  </pre>

                </div>

              </div>

            ))}
            {problem.hint && problem.hint.replace(/<[^>]*>/g, "").trim() && (
              <HintSection title={t("Hint")} html={problem.hint} />
            )}
            {problem.source && (
              <section>
                <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                  {t("Source")}
                </h3>

                <p className="text-sm text-muted">{problem.source}</p>

              </section>

            )}
          </div>

        </GlassPanel>

        <GlassCard>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            languages={problem.languages || []}
            onLanguageChange={onLangChange}
            onReset={onReset}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              {result != null && submissionId && (
                <>
                  <span className="text-muted">{t("Status")}</span>

                  <Link href={`/status/${submissionId}`}>
                    <StatusBadge status={result} />
                  </Link>

                </>

              )}
              {problem.my_status === 0 && result == null && (
                <span className="text-[var(--success)] text-sm">
                  {t("You_have_solved_the_problem")}
                </span>

              )}
              {contestID && contestStatusEnded && (
                <span className="text-amber-400 text-sm">
                  {t("Contest_has_ended")}
                </span>

              )}
            </div>

            <Button onClick={submit} disabled={submitting}>
              {submitting ? t("Submitting") : t("Submit")}
            </Button>

          </div>

        </GlassCard>

      </div>

      <div className="space-y-4">
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">{t("Information")}</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">{t("Time_Limit")}</dt>
              <dd>{problem.time_limit} ms</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">{t("Memory_Limit")}</dt>
              <dd>{problem.memory_limit} MB</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">{t("Level")}</dt>
              <dd>
                <Badge
                  variant={
                    problem.difficulty === "High"
                      ? "danger"
                      : problem.difficulty === "Mid"
                        ? "warning"
                        : "success"
                  }
                >
                  {problem.difficulty}
                </Badge>
              </dd>
            </div>
            {problem.created_by && (
              <div className="flex justify-between gap-2">
                <dt className="text-muted">{t("Created")}</dt>
                <dd>{problem.created_by.username}</dd>
              </div>
            )}
          </dl>
          {problem.tags?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted">{t("Tags")}</p>
              <div className="flex flex-wrap gap-1">
                {problem.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {statusInfo && (
            <p className="mt-3 text-xs text-muted">{statusInfo.name}</p>
          )}
        </GlassCard>

        {(!contestID || oiRealtime()) && (
          <ProblemStatistic
            statisticInfo={problem.statistic_info}
            acceptedNumber={problem.accepted_number}
            submissionNumber={problem.submission_number}
          />
        )}
      </div>

    </div>

  );
}

function HintSection({ title, html }: { title: string; html: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
          open
            ? "border-[var(--pink)]/30 bg-[var(--pink-soft)]"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        )}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--pink-bright)]">
          {title}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="hint"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSoft}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-4">
              <HtmlContent html={html} />
            </div>

          </motion.div>

        )}
      </AnimatePresence>

    </section>

  );
}
