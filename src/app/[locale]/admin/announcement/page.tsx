"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import adminApi from "@/lib/api/admin";
import { utcToLocal } from "@/lib/time";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  content: string;
  visible: boolean;
  create_time: string;
};

export default function AdminAnnouncementPage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [list, setList] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAnnouncementList((page - 1) * limit, limit);
      const data = res.data.data as { results: Announcement[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing?.title) return;
    if (editing.id) {
      await adminApi.updateAnnouncement(editing);
    } else {
      await adminApi.createAnnouncement({
        title: editing.title,
        content: editing.content || "",
        visible: editing.visible ?? true,
      });
    }
    toast.success(tm("Success"));
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete?")) return;
    await adminApi.deleteAnnouncement(id);
    toast.success(tm("Success"));
    load();
  };

  return (
    <div className="space-y-4">
      <GlassPanel
        title={t("General_Announcement")}
        extra={
          <Button
            size="sm"
            onClick={() =>
              setEditing({ title: "", content: "", visible: true })
            }
          >
            <Plus className="h-4 w-4" />
            {t("Announcement_Title")}
          </Button>

        }
      >
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="pb-3 pr-3">ID</th>

                <th className="pb-3 pr-3">{t("Announcement_Title")}</th>

                <th className="pb-3 pr-3">{t("Announcement_visible")}</th>

                <th className="pb-3 pr-3">{t("Create_Time")}</th>

                <th className="pb-3">Actions</th>

              </tr>

            </thead>

            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-3 pr-3">{a.id}</td>

                  <td className="py-3 pr-3">{a.title}</td>

                  <td className="py-3 pr-3">{a.visible ? "Yes" : "No"}</td>

                  <td className="py-3 pr-3 text-muted">
                    {utcToLocal(a.create_time)}
                  </td>

                  <td className="py-3 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(a.id)}
                    >
                      <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                    </Button>

                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        )}
        <Pagination
          total={total}
          page={page}
          pageSize={limit}
          onPageChange={setPage}
          showSizer={false}
        />
      </GlassPanel>

      {editing && (
        <GlassPanel title={editing.id ? "Edit" : "Create"}>
          <div className="space-y-3">
            <Input
              placeholder={t("Announcement_Title")}
              value={editing.title || ""}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
            />
            <RichTextEditor
              value={editing.content || ""}
              onChange={(html) => setEditing({ ...editing, content: html })}
            />
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={!!editing.visible}
                onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
              />
              {t("Announcement_visible")}
            </label>

            <div className="flex gap-2">
              <Button onClick={save}>{tm("Save")}</Button>

              <Button variant="secondary" onClick={() => setEditing(null)}>
                {tm("Cancel")}
              </Button>

            </div>

          </div>

        </GlassPanel>

      )}
    </div>

  );
}
