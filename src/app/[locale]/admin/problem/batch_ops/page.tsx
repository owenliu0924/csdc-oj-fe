"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import adminApi from "@/lib/api/admin";
import { downloadBlob } from "@/lib/utils";
import apiClient from "@/lib/api/client";
import { getCookie } from "@/lib/utils";

export default function BatchOpsPage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [ids, setIds] = useState("");

  const exportProblems = async () => {
    const problem_id = ids
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const res = await adminApi.exportProblems({ problem_id });

    const data = res.data as unknown;
    if (data instanceof Blob) {
      downloadBlob(data, "problems.qduoj");
    } else {
      toast.success(tm("Success"));
    }
  };

  const importProblems = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const csrf = getCookie("csrftoken");
    await apiClient.post("admin/import_problem", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
    });
    toast.success(tm("Success"));
  };

  return (
    <div className="space-y-4">
      <GlassPanel title={t("Export_Import_Problem")}>
        <div className="space-y-4 max-w-lg">
          <div>
            <p className="mb-2 text-sm text-muted">
              Export — problem IDs (comma separated)
            </p>

            <Textarea
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              placeholder="1, 2, 3"
            />
            <Button className="mt-2" onClick={exportProblems}>
              Export
            </Button>

          </div>

          <div>
            <p className="mb-2 text-sm text-muted">Import — .zip / .qduoj file</p>

            <Input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importProblems(f);
              }}
            />
          </div>

        </div>

      </GlassPanel>

    </div>

  );
}
