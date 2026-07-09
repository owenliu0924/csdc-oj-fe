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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Loading } from "@/components/oj/loading";
import adminApi from "@/lib/api/admin";
import dayjs from "dayjs";

type Props = { contestId?: string };

export function ContestForm({ contestId }: Props) {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const router = useRouter();
  const [loading, setLoading] = useState(!!contestId);
  const [form, setForm] = useState({
    id: undefined as number | undefined,
    title: "",
    description: "",
    start_time: dayjs().format("YYYY-MM-DDTHH:mm"),
    end_time: dayjs().add(2, "hour").format("YYYY-MM-DDTHH:mm"),
    password: "",
    rule_type: "ACM",
    real_time_rank: true,
    visible: true,
    allowed_ip_ranges: [] as { value: string }[],
  });

  useEffect(() => {
    if (!contestId) return;
    adminApi
      .getContest(contestId)
      .then((res) => {
        const c = res.data.data as Record<string, unknown>;
        setForm({
          id: c.id as number,
          title: (c.title as string) || "",
          description: (c.description as string) || "",
          start_time: dayjs(c.start_time as string).format("YYYY-MM-DDTHH:mm"),
          end_time: dayjs(c.end_time as string).format("YYYY-MM-DDTHH:mm"),
          password: (c.password as string) || "",
          rule_type: (c.rule_type as string) || "ACM",
          real_time_rank: !!c.real_time_rank,
          visible: c.visible !== false,
          allowed_ip_ranges: ((c.allowed_ip_ranges as string[]) || []).map(
            (v) => ({ value: v })
          ),
        });
      })
      .finally(() => setLoading(false));
  }, [contestId]);

  const save = async () => {
    const payload = {
      ...form,
      start_time: dayjs(form.start_time).toISOString(),
      end_time: dayjs(form.end_time).toISOString(),
      allowed_ip_ranges: form.allowed_ip_ranges.map((x) => x.value).filter(Boolean),
    };
    if (contestId || form.id) {
      await adminApi.editContest(payload);
    } else {
      await adminApi.createContest(payload);
    }
    toast.success(tm("Success"));
    router.push("/admin/contest");
  };

  if (loading) return <Loading />;

  return (
    <GlassPanel title={contestId ? "Edit Contest" : t("Create_Contest")}>
      <div className="max-w-2xl space-y-4">
        <div className="space-y-1">
          <Label>{t("ContestTitle")}</Label>

          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label>{t("ContestDescription")}</Label>

          <RichTextEditor
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t("Contest_Start_Time")}</Label>

            <Input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>{t("Contest_End_Time")}</Label>

            <Input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </div>

        </div>

        <div className="space-y-1">
          <Label>{t("Contest_Password")}</Label>

          <Input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Leave empty for public"
          />
        </div>

        <div className="space-y-1">
          <Label>{t("Contest_Rule_Type")}</Label>

          <Select
            value={form.rule_type}
            onValueChange={(v) => setForm({ ...form, rule_type: v })}
            disabled={!!contestId}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ACM">ACM</SelectItem>

              <SelectItem value="OI">OI</SelectItem>

            </SelectContent>

          </Select>

        </div>

        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={form.real_time_rank}
            onCheckedChange={(v) => setForm({ ...form, real_time_rank: v })}
          />
          {t("Real_Time_Rank")}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={form.visible}
            onCheckedChange={(v) => setForm({ ...form, visible: v })}
          />
          {t("Visible")}
        </label>

        <div className="flex gap-2">
          <Button onClick={save}>{tm("Save")}</Button>

          <Button variant="secondary" onClick={() => router.back()}>
            {tm("Cancel")}
          </Button>

        </div>

      </div>

    </GlassPanel>

  );
}
