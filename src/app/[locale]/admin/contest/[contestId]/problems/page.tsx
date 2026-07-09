"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/oj/loading";
import { Link } from "@/i18n/navigation";
import adminApi from "@/lib/api/admin";
import { Plus, Pencil, Trash2, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Problem = {
  id: number;
  _id: string;
  title: string;
  visible: boolean;
};

export default function AdminContestProblemsPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = use(params);
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [list, setList] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [publicId, setPublicId] = useState("");
  const [displayId, setDisplayId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getContestProblemList({
        contest_id: contestId,
        paging: false,
      });
      const data = res.data.data;
      setList(
        (Array.isArray(data)
          ? data
          : (data as { results: Problem[] }).results) as Problem[]
      );
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: number) => {
    if (!confirm("Delete?")) return;
    await adminApi.deleteContestProblem(id);
    toast.success(tm("Success"));
    load();
  };

  const makePublic = async (id: number) => {
    const display_id = prompt("Public display ID?");
    if (!display_id) return;
    await adminApi.makeContestProblemPublic({ id, display_id });
    toast.success(tm("Success"));
  };

  const addFromPublic = async () => {
    await adminApi.addProblemFromPublic({
      contest_id: contestId,
      problem_id: publicId,
      display_id: displayId,
    });
    toast.success(tm("Success"));
    setAddOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <GlassPanel
        title={t("Contest_Problem_List")}
        extra={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
              From Public
            </Button>

            <Button size="sm" asChild>
              <Link href={`/admin/contest/${contestId}/problem/create`}>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="pb-3 pr-2">#</th>

                <th className="pb-3 pr-2">{t("Title")}</th>

                <th className="pb-3">Actions</th>

              </tr>

            </thead>

            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2 pr-2">{p._id}</td>

                  <td className="py-2 pr-2">{p.title}</td>

                  <td className="py-2 flex gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <Link
                        href={`/admin/contest/${contestId}/problem/${p.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                    </Button>

                    <Button size="icon" variant="ghost" onClick={() => makePublic(p.id)}>
                      <Globe className="h-4 w-4" />
                    </Button>

                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                    </Button>

                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        )}
      </GlassPanel>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add from public</DialogTitle>

          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Public problem id"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
            />
            <Input
              placeholder="Display ID in contest"
              value={displayId}
              onChange={(e) => setDisplayId(e.target.value)}
            />
            <Button onClick={addFromPublic}>{tm("Save")}</Button>

          </div>

        </DialogContent>

      </Dialog>

    </div>

  );
}
