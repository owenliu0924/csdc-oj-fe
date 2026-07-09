"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Loading } from "@/components/oj/loading";
import adminApi from "@/lib/api/admin";
import { Plus, Trash2, X } from "lucide-react";

type Sample = { input: string; output: string };
type ProblemFormData = {
  id?: number;
  _id?: string;
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  time_limit: number;
  memory_limit: number;
  difficulty: string;
  visible: boolean;
  share_submission: boolean;
  tags: string[];
  samples: Sample[];
  hint: string;
  source: string;
  languages: string[];
  template: Record<string, string>;
  spj: boolean;
  spj_language: string;
  spj_code: string;
  spj_compile_ok?: boolean;
  test_case_id?: string;
  test_case_score?: { input_name: string; output_name: string; score: number }[];
  io_mode: { io_mode: string; input: string; output: string };
  rule_type?: string;
};

const defaultProblem = (): ProblemFormData => ({
  title: "",
  description: "",
  input_description: "",
  output_description: "",
  time_limit: 1000,
  memory_limit: 256,
  difficulty: "Low",
  visible: true,
  share_submission: false,
  tags: [],
  samples: [{ input: "", output: "" }],
  hint: "",
  source: "",
  languages: ["C", "C++", "Java", "Python3"],
  template: {},
  spj: false,
  spj_language: "C++",
  spj_code: "",
  io_mode: { io_mode: "Standard IO", input: "input.txt", output: "output.txt" },
});

type Props = {
  problemId?: string;
  contestId?: string;
};

export function ProblemForm({ problemId, contestId }: Props) {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const router = useRouter();
  const [problem, setProblem] = useState<ProblemFormData>(defaultProblem());
  const [loading, setLoading] = useState(!!problemId);
  const [tagInput, setTagInput] = useState("");
  const [allLangs, setAllLangs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getLanguages().then((res) => {
      const data = res.data.data as { languages?: { name: string }[] } | string[];
      if (Array.isArray(data)) {
        setAllLangs(data as string[]);
      } else if (data.languages) {
        setAllLangs(data.languages.map((l) => l.name));
      }
    });
  }, []);

  useEffect(() => {
    if (!problemId) return;
    setLoading(true);
    const fetcher = contestId
      ? adminApi.getContestProblem(problemId)
      : adminApi.getProblem(problemId);
    fetcher
      .then((res) => {
        const p = res.data.data as ProblemFormData;
        setProblem({ ...defaultProblem(), ...p });
      })
      .finally(() => setLoading(false));
  }, [problemId, contestId]);

  const set = <K extends keyof ProblemFormData>(k: K, v: ProblemFormData[K]) =>
    setProblem((p) => ({ ...p, [k]: v }));

  const compileSpj = async () => {
    await adminApi.compileSPJ({
      spj_code: problem.spj_code,
      spj_language: problem.spj_language,
    });
    toast.success(tm("Success"));
    set("spj_compile_ok", true);
  };

  const uploadTestCase = async (file: File) => {
    const data = await adminApi.uploadTestCase(file);
    if (data.error) {
      toast.error(data.data || "Upload failed");
      return;
    }
    const d = data.data as {
      id: string;
      info: { input_name: string; output_name: string; score?: number }[];
    };
    set("test_case_id", d.id);
    set(
      "test_case_score",
      (d.info || []).map((i) => ({
        input_name: i.input_name,
        output_name: i.output_name,
        score: i.score ?? 10,
      }))
    );
    toast.success(tm("Success"));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...problem, contest_id: contestId };
      if (problemId || problem.id) {
        if (contestId) await adminApi.editContestProblem(payload);
        else await adminApi.editProblem(payload);
      } else {
        if (contestId) await adminApi.createContestProblem(payload);
        else await adminApi.createProblem(payload);
      }
      toast.success(tm("Success"));
      if (contestId) router.push(`/admin/contest/${contestId}/problems`);
      else router.push("/admin/problems");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <GlassPanel title={problemId ? t("Edit_Problem") || "Edit Problem" : t("Create_Problem")}>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <div className="space-y-1">
              <Label>{t("Display_ID")}</Label>

              <Input value={problem._id || ""} onChange={(e) => set("_id", e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>{t("Title")}</Label>

              <Input value={problem.title} onChange={(e) => set("title", e.target.value)} />
            </div>

          </div>

          <div className="space-y-1">
            <Label>{t("Description")}</Label>

            <RichTextEditor value={problem.description} onChange={(v) => set("description", v)} />
          </div>

          <div className="space-y-1">
            <Label>{t("Input_Description")}</Label>

            <RichTextEditor value={problem.input_description} onChange={(v) => set("input_description", v)} />
          </div>

          <div className="space-y-1">
            <Label>{t("Output_Description")}</Label>

            <RichTextEditor value={problem.output_description} onChange={(v) => set("output_description", v)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t("Time_Limit")} (ms)</Label>

              <Input type="number" value={problem.time_limit} onChange={(e) => set("time_limit", Number(e.target.value))} />
            </div>

            <div className="space-y-1">
              <Label>{t("Memory_limit")} (MB)</Label>

              <Input type="number" value={problem.memory_limit} onChange={(e) => set("memory_limit", Number(e.target.value))} />
            </div>

            <div className="space-y-1">
              <Label>{t("Difficulty")}</Label>

              <Select value={problem.difficulty} onValueChange={(v) => set("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>

                <SelectContent>
                  <SelectItem value="Low">{t("Low")}</SelectItem>

                  <SelectItem value="Mid">{t("Mid")}</SelectItem>

                  <SelectItem value="High">{t("High")}</SelectItem>

                </SelectContent>

              </Select>

            </div>

          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={problem.visible} onCheckedChange={(v) => set("visible", v)} />
              {t("Visible")}
            </label>

            <label className="flex items-center gap-2 text-sm">
              <Switch checked={problem.share_submission} onCheckedChange={(v) => set("share_submission", v)} />
              {t("ShareSubmission")}
            </label>

          </div>

          <div className="space-y-2">
            <Label>{t("Tag")}</Label>

            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <Badge key={tag} variant="success" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => set("tags", problem.tags.filter((x) => x !== tag))}>
                    <X className="h-3 w-3" />
                  </button>

                </Badge>

              ))}
            </div>

            <div className="flex gap-2">
              <Input
                className="max-w-xs"
                placeholder={t("New_Tag")}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    e.preventDefault();
                    if (!problem.tags.includes(tagInput.trim())) {
                      set("tags", [...problem.tags, tagInput.trim()]);
                    }
                    setTagInput("");
                  }
                }}
              />
            </div>

          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("Input_Samples")} / {t("Output_Samples")}</Label>

              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => set("samples", [...problem.samples, { input: "", output: "" }])}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Add_Sample")}
              </Button>

            </div>

            {problem.samples.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-2">
                <Textarea
                  placeholder="Input"
                  value={s.input}
                  onChange={(e) => {
                    const samples = [...problem.samples];
                    samples[i] = { ...samples[i], input: e.target.value };
                    set("samples", samples);
                  }}
                />
                <div className="flex gap-2">
                  <Textarea
                    className="flex-1"
                    placeholder="Output"
                    value={s.output}
                    onChange={(e) => {
                      const samples = [...problem.samples];
                      samples[i] = { ...samples[i], output: e.target.value };
                      set("samples", samples);
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => set("samples", problem.samples.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                  </Button>

                </div>

              </div>

            ))}
          </div>

          <div className="space-y-1">
            <Label>{t("Hint")}</Label>

            <RichTextEditor value={problem.hint} onChange={(v) => set("hint", v)} />
          </div>

          <div className="space-y-1">
            <Label>{t("Source")}</Label>

            <Input value={problem.source} onChange={(e) => set("source", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("Languages")}</Label>

            <div className="flex flex-wrap gap-2">
              {(allLangs.length ? allLangs : problem.languages).map((lang) => (
                <label key={lang} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={problem.languages.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) set("languages", [...problem.languages, lang]);
                      else set("languages", problem.languages.filter((l) => l !== lang));
                    }}
                  />
                  {lang}
                </label>

              ))}
            </div>

          </div>

          <div className="space-y-2">
            <Label>{t("Code_Template")}</Label>

            {problem.languages.map((lang) => (
              <div key={lang} className="space-y-1">
                <span className="text-xs text-muted">{lang}</span>

                <Textarea
                  className="font-mono text-xs"
                  rows={4}
                  value={problem.template[lang] || ""}
                  onChange={(e) =>
                    set("template", { ...problem.template, [lang]: e.target.value })
                  }
                />
              </div>

            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={problem.spj} onCheckedChange={(v) => set("spj", v)} />
              {t("Use_Special_Judge")}
            </label>

            {problem.spj && (
              <>
                <Select value={problem.spj_language} onValueChange={(v) => set("spj_language", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>

                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>

                    <SelectItem value="C++">C++</SelectItem>

                  </SelectContent>

                </Select>

                <Textarea
                  className="font-mono text-xs"
                  rows={8}
                  value={problem.spj_code}
                  onChange={(e) => set("spj_code", e.target.value)}
                  placeholder={t("Special_Judge_Code")}
                />
                <Button type="button" variant="secondary" onClick={compileSpj}>
                  {t("Compile")}
                </Button>

              </>

            )}
          </div>

          <div className="space-y-2">
            <Label>{t("TestCase")}</Label>

            <Input
              type="file"
              accept=".zip"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadTestCase(f);
              }}
            />
            {problem.test_case_id && (
              <p className="text-xs text-muted">ID: {problem.test_case_id}</p>

            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t("IOMode")}</Label>

              <Select
                value={problem.io_mode.io_mode}
                onValueChange={(v) =>
                  set("io_mode", { ...problem.io_mode, io_mode: v })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>

                <SelectContent>
                  <SelectItem value="Standard IO">Standard IO</SelectItem>

                  <SelectItem value="File IO">File IO</SelectItem>

                </SelectContent>

              </Select>

            </div>

            {problem.io_mode.io_mode === "File IO" && (
              <>
                <div className="space-y-1">
                  <Label>{t("InputFileName")}</Label>

                  <Input
                    value={problem.io_mode.input}
                    onChange={(e) =>
                      set("io_mode", { ...problem.io_mode, input: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>{t("OutputFileName")}</Label>

                  <Input
                    value={problem.io_mode.output}
                    onChange={(e) =>
                      set("io_mode", { ...problem.io_mode, output: e.target.value })
                    }
                  />
                </div>

              </>

            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving}>
              {tm("Save")}
            </Button>

            <Button variant="secondary" onClick={() => router.back()}>
              {tm("Cancel")}
            </Button>

          </div>

        </div>

      </GlassPanel>

    </div>

  );
}
