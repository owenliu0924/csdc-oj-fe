"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
import { ChevronDown, GripHorizontal, GripVertical, Play } from "lucide-react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { TestcasePanel, Testcase, RunResult } from "@/components/editor/testcase-panel";
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

  const [testcases, setTestcases] = useState<Testcase[]>([]);
  const [activeTestcaseTab, setActiveTestcaseTab] = useState("tc-0");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const loadProblem = useCallback(async () => {
    setLoading(true);
    try {
      const res = contestID
        ? await ojApi.getContestProblem(problemID, contestID)
        : await ojApi.getProblem(problemID);
      const p = res.data.data as Problem;
      setProblem(p);
      if (p.samples?.length > 0) {
        const initTc = p.samples.map((s, i) => ({
          id: `tc-${i}`,
          input: s.input,
          expected_output: s.output,
        }));
        setTestcases(initTc);
        setActiveTestcaseTab(initTc[0].id);
      } else {
        const id = `tc-${Date.now()}`;
        setTestcases([{ id, input: "", expected_output: "" }]);
        setActiveTestcaseTab(id);
      }
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

  const runTestCode = async () => {
    if (!isAuth()) {
      openAuth("login");
      return;
    }
    const currentTc = testcases.find((t) => t.id === activeTestcaseTab);
    if (!currentTc) return;

    setIsTesting(true);
    setRunResult(null);
    try {
      const res = await ojApi.testCode({
        problem_id: problem!.id,
        language,
        code,
        input: currentTc.input,
        expected_output: currentTc.expected_output,
      });
      const data = res.data.data as { stdout: string; stderr: string; status: string };
      setRunResult({
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        status: data.status || "Finished",
        testcaseId: activeTestcaseTab,
      });
      setActiveTestcaseTab("result");
    } catch (error) {
      const err = error as { response?: { data?: { data?: string } }, message?: string };
      setRunResult({
        stdout: "",
        stderr: err?.response?.data?.data || err?.message || "Request Failed",
        status: "Error",
        testcaseId: activeTestcaseTab,
      });
      setActiveTestcaseTab("result");
    } finally {
      setIsTesting(false);
    }
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
    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      <PanelGroup orientation="horizontal" className="hidden lg:flex gap-2">
        <Panel defaultSize={40} minSize={30} className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
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

              {problem.samples?.length > 0 && (
                <div className="space-y-6">
                  {problem.samples.map((sample, idx) => (
                    <div key={idx} className="space-y-4">
                      <section>
                        <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                          {t("Sample_Input")} {problem.samples.length > 1 ? idx + 1 : ""}
                        </h3>
                        <pre className="p-3 rounded-xl border border-white/10 bg-black/40 overflow-x-auto text-sm font-mono whitespace-pre-wrap">{sample.input}</pre>
                      </section>
                      <section>
                        <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                          {t("Sample_Output")} {problem.samples.length > 1 ? idx + 1 : ""}
                        </h3>
                        <pre className="p-3 rounded-xl border border-white/10 bg-black/40 overflow-x-auto text-sm font-mono whitespace-pre-wrap">{sample.output}</pre>
                      </section>
                    </div>
                  ))}
                </div>
              )}

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
        </Panel>

        <PanelResizeHandle className="w-2 flex items-center justify-center cursor-col-resize hover:bg-white/5 transition-colors rounded-full group mx-1">
          <GripVertical className="h-4 w-4 text-white/20 group-hover:text-white/60" />
        </PanelResizeHandle>

        <Panel defaultSize={60} minSize={40} className="flex flex-col h-full">
          <PanelGroup orientation="vertical">
            <Panel defaultSize={60} minSize={30} className="flex flex-col">
              <GlassCard className="flex-1 flex flex-col p-4 mb-2">
                <CodeEditor
                  className="flex-1 min-h-0"
                  value={code}
                  onChange={setCode}
                  language={language}
                  languages={problem.languages || []}
                  onLanguageChange={onLangChange}
                  onReset={onReset}
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
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
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={runTestCode}
                      disabled={isTesting}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {isTesting ? t("Running") : t("Run_Code")}
                    </Button>
                    <Button onClick={submit} disabled={submitting}>
                      {submitting ? t("Submitting") : t("Submit")}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </Panel>

            <PanelResizeHandle className="h-2 flex items-center justify-center cursor-row-resize hover:bg-white/5 transition-colors rounded-full group my-1">
              <GripHorizontal className="h-4 w-4 text-white/20 group-hover:text-white/60" />
            </PanelResizeHandle>

            <Panel defaultSize={40} minSize={20}>
              <TestcasePanel
                testcases={testcases}
                setTestcases={setTestcases}
                activeTab={activeTestcaseTab}
                setActiveTab={setActiveTestcaseTab}
                runResult={runResult}
                className="h-full"
              />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      <div className="flex flex-col lg:hidden gap-6">
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
                </h3>
                <HtmlContent html={problem.input_description} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                  {t("Output")}
                </h3>
                <HtmlContent html={problem.output_description} />
              </section>
              {problem.samples?.length > 0 && (
                <div className="space-y-6">
                  {problem.samples.map((sample, idx) => (
                    <div key={idx} className="space-y-4">
                      <section>
                        <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                          {t("Sample_Input")} {problem.samples.length > 1 ? idx + 1 : ""}
                        </h3>
                        <pre className="p-3 rounded-xl border border-white/10 bg-black/40 overflow-x-auto text-sm font-mono whitespace-pre-wrap">{sample.input}</pre>
                      </section>
                      <section>
                        <h3 className="mb-2 text-sm font-medium text-[var(--pink-bright)]">
                          {t("Sample_Output")} {problem.samples.length > 1 ? idx + 1 : ""}
                        </h3>
                        <pre className="p-3 rounded-xl border border-white/10 bg-black/40 overflow-x-auto text-sm font-mono whitespace-pre-wrap">{sample.output}</pre>
                      </section>
                    </div>
                  ))}
                </div>
              )}
              {problem.hint && problem.hint.replace(/<[^>]*>/g, "").trim() && (
                <HintSection title={t("Hint")} html={problem.hint} />
              )}
          </div>
        </GlassPanel>

        <GlassCard className="min-h-[500px] flex flex-col">
          <CodeEditor
            className="flex-1"
            value={code}
            onChange={setCode}
            language={language}
            languages={problem.languages || []}
            onLanguageChange={onLangChange}
            onReset={onReset}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
             <div className="flex items-center gap-3 ml-auto">
              <Button
                variant="secondary"
                onClick={runTestCode}
                disabled={isTesting}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {isTesting ? t("Running") : t("Run_Code")}
              </Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? t("Submitting") : t("Submit")}
              </Button>
            </div>
          </div>
        </GlassCard>

        <div className="h-[400px]">
          <TestcasePanel
            testcases={testcases}
            setTestcases={setTestcases}
            activeTab={activeTestcaseTab}
            setActiveTab={setActiveTestcaseTab}
            runResult={runResult}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

function HintSection({ title, html }: { title: string; html: string }) {
  const hints = useMemo(() => {
    return html.split(/<hr\s*\/?>|---/).map((s) => s.trim()).filter(Boolean);
  }, [html]);

  const [unlockedCount, setUnlockedCount] = useState(0);
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());

  const toggleHint = (index: number) => {
    if (index > unlockedCount) return;

    if (index === unlockedCount) {
      setUnlockedCount(index + 1);
      setOpenHints((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    } else {
      setOpenHints((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    }
  };

  const hasMultiple = hints.length > 1;

  return (
    <div className="space-y-3">
      {hints.map((hintHtml, index) => {
        const isDisabled = index > unlockedCount;
        const isOpen = openHints.has(index);
        const currentTitle = hasMultiple ? `${title} ${index + 1}` : title;

        return (
          <section key={index} className={isDisabled ? "opacity-50" : ""}>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => toggleHint(index)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                isOpen
                  ? "border-[var(--pink)]/30 bg-[var(--pink-soft)]"
                  : "border-white/10 bg-white/[0.03]",
                !isDisabled && !isOpen && "hover:bg-white/[0.06]",
                isDisabled && "cursor-not-allowed"
              )}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium text-[var(--pink-bright)]">
                {currentTitle}
              </span>

              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="hint-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={springSoft}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-4">
                    <HtmlContent html={hintHtml} />
                  </div>

                </motion.div>

              )}
            </AnimatePresence>

          </section>

        );
      })}
    </div>

  );
}
