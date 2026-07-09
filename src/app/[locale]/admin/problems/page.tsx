"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { Link } from "@/i18n/navigation";
import adminApi from "@/lib/api/admin";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

type Problem = {
  id: number;
  _id: string;
  title: string;
  difficulty: string;
  visible: boolean;
  created_by: { username: string };
};

export default function AdminProblemListPage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [list, setList] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProblemList({
        paging: true,
        offset: (page - 1) * limit,
        limit,
        keyword: keyword || undefined,
      });
      const data = res.data.data as { results: Problem[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: number) => {
    if (!confirm("Delete problem?")) return;
    await adminApi.deleteProblem(id);
    toast.success(tm("Success"));
    load();
  };

  return (
    <GlassPanel
      title={t("Problem_List")}
      extra={
        <div className="flex gap-2">
          <Input
            className="w-40"
            placeholder="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          />
          <Button size="sm" variant="secondary" onClick={() => { setPage(1); load(); }}>
            <Search className="h-3.5 w-3.5" />
          </Button>

          <Button size="sm" asChild>
            <Link href="/admin/problem/create">
              <Plus className="h-3.5 w-3.5" />
              {t("Create_Problem")}
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

                <th className="pb-3 pr-2">#</th>

                <th className="pb-3 pr-2">{t("Title")}</th>

                <th className="pb-3 pr-2">{t("Difficulty")}</th>

                <th className="pb-3 pr-2">{t("Visible")}</th>

                <th className="pb-3 pr-2">Author</th>

                <th className="pb-3">Actions</th>

              </tr>

            </thead>

            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2 pr-2">{p.id}</td>

                  <td className="py-2 pr-2">{p._id}</td>

                  <td className="py-2 pr-2">{p.title}</td>

                  <td className="py-2 pr-2">
                    <Badge variant="secondary">{p.difficulty}</Badge>

                  </td>

                  <td className="py-2 pr-2">{p.visible ? "Yes" : "No"}</td>

                  <td className="py-2 pr-2 text-muted">{p.created_by?.username}</td>

                  <td className="py-2 flex gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/admin/problem/edit/${p.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>

                    </Button>

                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-[var(--danger)]" />
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
