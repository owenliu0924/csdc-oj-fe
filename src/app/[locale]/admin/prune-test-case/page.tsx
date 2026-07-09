"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import dayjs from "dayjs";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import adminApi from "@/lib/api/admin";
import { Trash2 } from "lucide-react";

type OrphanTestCase = {
  id: string;

  create_time: number;
};

export default function PruneTestCasePage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [list, setList] = useState<OrphanTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getInvalidTestCaseList();
      const raw = res.data.data;
      setList(Array.isArray(raw) ? (raw as OrphanTestCase[]) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const prune = async (id: string) => {
    if (!confirm("Delete this orphan test case?")) return;
    await adminApi.pruneTestCase(id);
    toast.success(tm("Success"));
    load();
  };

  const pruneAll = async () => {
    if (!confirm("Delete ALL orphan test cases?")) return;
    setDeletingAll(true);
    try {
      await adminApi.pruneTestCase();
      toast.success(tm("Success"));
      await load();
    } finally {
      setDeletingAll(false);
    }
  };

  const formatTime = (ts: number) => {

    if (ts > 1e12) return dayjs(ts).format("YYYY-M-D HH:mm:ss");
    return dayjs.unix(ts).format("YYYY-M-D HH:mm:ss");
  };

  return (
    <GlassPanel
      title={t("Test_Case_Prune_Test_Case")}
      extra={
        list.length > 0 ? (
          <Button
            size="sm"
            variant="danger"
            disabled={deletingAll}
            onClick={pruneAll}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete All
          </Button>

        ) : undefined
      }
    >
      <p className="mb-4 text-xs text-[var(--muted)]">
        These test cases are not owned by any problem; you can clean them
        safely.
      </p>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState message="No orphan test cases" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="pb-3 pr-3 font-medium">Last Modified</th>

                <th className="pb-3 pr-3 font-medium">Test Case ID</th>

                <th className="pb-3 font-medium w-20">Actions</th>

              </tr>

            </thead>

            <tbody>
              {list.map((row, i) => (
                <tr
                  key={`${row.id}-${i}`}
                  className="border-b border-white/5"
                >
                  <td className="py-2.5 pr-3 text-xs text-muted whitespace-nowrap">
                    {formatTime(row.create_time)}
                  </td>

                  <td className="py-2.5 pr-3 font-mono text-xs break-all">
                    {row.id}
                  </td>

                  <td className="py-2.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => prune(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                    </Button>

                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        </div>

      )}
    </GlassPanel>

  );
}
