"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { Link } from "@/i18n/navigation";
import adminApi from "@/lib/api/admin";
import { utcToLocal } from "@/lib/time";
import { Plus, Pencil, Search, BookOpen, Megaphone } from "lucide-react";

type Contest = {
  id: number;
  title: string;
  rule_type: string;
  start_time: string;
  end_time: string;
  visible: boolean;
  created_by: { username: string };
};

export default function AdminContestListPage() {
  const t = useTranslations("admin");
  const [list, setList] = useState<Contest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getContestList((page - 1) * limit, limit, keyword);
      const data = res.data.data as { results: Contest[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <GlassPanel
      title={t("Contest_List")}
      extra={
        <div className="flex gap-2">
          <Input
            className="w-40"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          />
          <Button size="sm" variant="secondary" onClick={() => { setPage(1); load(); }}>
            <Search className="h-3.5 w-3.5" />
          </Button>

          <Button size="sm" asChild>
            <Link href="/admin/contest/create">
              <Plus className="h-3.5 w-3.5" />
              {t("Create_Contest")}
            </Link>

          </Button>

        </div>

      }
    >
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="pb-3 pr-2">ID</th>

                <th className="pb-3 pr-2">{t("ContestTitle")}</th>

                <th className="pb-3 pr-2">Rule</th>

                <th className="pb-3 pr-2">{t("Contest_Start_Time")}</th>

                <th className="pb-3 pr-2">{t("Visible")}</th>

                <th className="pb-3">Actions</th>

              </tr>

            </thead>

            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="py-2 pr-2">{c.id}</td>

                  <td className="py-2 pr-2 font-medium">{c.title}</td>

                  <td className="py-2 pr-2">
                    <Badge variant="info">{c.rule_type}</Badge>

                  </td>

                  <td className="py-2 pr-2 text-muted text-xs">
                    {utcToLocal(c.start_time)}
                  </td>

                  <td className="py-2 pr-2">{c.visible ? "Yes" : "No"}</td>

                  <td className="py-2 flex flex-wrap gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/admin/contest/${c.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>

                    </Button>

                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/admin/contest/${c.id}/problems`}>
                        <BookOpen className="h-4 w-4" />
                      </Link>

                    </Button>

                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/admin/contest/${c.id}/announcement`}>
                        <Megaphone className="h-4 w-4" />
                      </Link>

                    </Button>

                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        </div>

      )}
      <Pagination total={total} page={page} pageSize={limit} onPageChange={setPage} showSizer={false} />
    </GlassPanel>

  );
}
