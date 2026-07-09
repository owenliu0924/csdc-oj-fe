"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { GlassPanel, GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { Link, useRouter } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { getACRate } from "@/lib/utils";
import { useUserStore } from "@/stores/user";
import { Shuffle, RotateCcw, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Problem = {
  id: number;
  _id: string;
  title: string;
  difficulty: string;
  submission_number: number;
  accepted_number: number;
  tags: string[];
};

type Tag = { name: string; id?: number };

export default function ProblemListPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProblemListInner />
    </Suspense>

  );
}

function ProblemListInner() {
  const t = useTranslations("m");
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useUserStore((s) => s.profile);
  const isAuth = useUserStore((s) => s.isAuthenticated);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") || ""
  );
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [limit, setLimit] = useState(Number(searchParams.get("limit") || 20));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ojApi.getProblemList((page - 1) * limit, limit, {
        keyword,
        difficulty,
        tag,
      });
      const data = res.data.data as { results: Problem[]; total: number };
      setProblems(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, keyword, difficulty, tag]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    ojApi.getProblemTagList().then((res) => {
      setTags((res.data.data as Tag[]) || []);
    });
  }, []);

  const problemStatus = (id: string) => {
    if (!isAuth()) return null;
    const acm = profile.acm_problems_status?.problems?.[id];
    if (acm) return acm.status;
    const oi = profile.oi_problems_status?.problems?.[id];
    if (oi) return oi.status;
    return null;
  };

  const pickOne = async () => {
    const res = await ojApi.pickone();
    const data = res.data.data as { problem_id?: string; res_id?: string };
    const id = data.problem_id || data.res_id;
    if (id) router.push(`/problem/${id}`);
  };

  return (
    <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 max-w-full">
        <GlassPanel
          title={t("Problem_List")}
          extra={
            <div className="flex flex-nowrap items-center gap-2">
              <Select
                value={difficulty || "all"}
                onValueChange={(v) => {
                  setDifficulty(v === "all" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t("Difficulty")} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">{t("All")}</SelectItem>

                  <SelectItem value="Low">{t("Low")}</SelectItem>

                  <SelectItem value="Mid">{t("Mid")}</SelectItem>

                  <SelectItem value="High">{t("High")}</SelectItem>

                </SelectContent>

              </Select>

              <div className="flex items-center gap-2 text-xs text-muted">
                <Switch checked={showTags} onCheckedChange={setShowTags} />
                {t("Tags")}
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <Input
                  className="w-40 pl-8"
                  placeholder="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      load();
                    }
                  }}
                />
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setKeyword("");
                  setDifficulty("");
                  setTag("");
                  setPage(1);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("Reset")}
              </Button>

            </div>

          }
        >
          {loading ? (
            <Loading />
          ) : (
            <div className="min-w-0 max-w-full">
              <table className="w-full min-w-[36rem] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="pb-3 pr-3 font-medium w-16">#</th>

                    <th className="pb-3 pr-3 font-medium">{t("Title") || "Title"}</th>

                    <th className="pb-3 pr-3 font-medium w-24">{t("Level")}</th>

                    <th className="pb-3 pr-3 font-medium w-20">{t("Total")}</th>

                    <th className="pb-3 font-medium w-24">{t("AC_Rate")}</th>

                  </tr>

                </thead>

                <tbody>
                  {problems.map((p) => {
                    const st = problemStatus(p._id);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-white/5 hover:bg-white/[0.03]"
                      >
                        <td className="py-3 pr-3">
                          <span
                            className={
                              st === 0
                                ? "text-[var(--success)]"
                                : st != null
                                  ? "text-amber-400"
                                  : ""
                            }
                          >
                            {p._id}
                          </span>

                        </td>

                        <td className="py-3 pr-3">
                          <Link
                            href={`/problem/${p._id}`}
                            className="hover:text-white font-medium"
                          >
                            {p.title}
                          </Link>

                          {showTags && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {p.tags?.map((tg) => (
                                <Badge
                                  key={tg}
                                  variant="secondary"
                                  className="cursor-pointer text-[10px]"
                                  onClick={() => {
                                    setTag(tg);
                                    setPage(1);
                                  }}
                                >
                                  {tg}
                                </Badge>

                              ))}
                            </div>

                          )}
                        </td>

                        <td className="py-3 pr-3">
                          <Badge
                            variant={
                              p.difficulty === "High"
                                ? "danger"
                                : p.difficulty === "Mid"
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {t(p.difficulty as "Low")}
                          </Badge>

                        </td>

                        <td className="py-3 pr-3 text-muted">
                          {p.submission_number}
                        </td>

                        <td className="py-3 text-muted">
                          {getACRate(p.accepted_number, p.submission_number)}
                        </td>

                      </tr>

                    );
                  })}
                </tbody>

              </table>

            </div>

          )}
          <Pagination
            total={total}
            page={page}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setLimit(s);
              setPage(1);
            }}
          />
        </GlassPanel>
      </div>

      <div className="min-w-0 max-w-full space-y-4">
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">{t("Tags")}</h3>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tg) => (
              <button
                key={tg.name}
                type="button"
                onClick={() => {
                  setTag(tg.name);
                  setPage(1);
                }}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  tag === tg.name
                    ? "border-white/20 bg-white/[0.08] text-white"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {tg.name}
              </button>

            ))}
          </div>

          <Button className="mt-4 w-full" variant="secondary" onClick={pickOne}>
            <Shuffle className="h-4 w-4" />
            {t("Pick_One")}
          </Button>

        </GlassCard>

      </div>

    </div>

  );
}
