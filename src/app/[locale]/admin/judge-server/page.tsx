"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/oj/loading";
import adminApi from "@/lib/api/admin";
import { utcToLocal } from "@/lib/time";
import { Trash2 } from "lucide-react";

type JudgeServer = {
  id: number;
  hostname: string;
  ip: string;
  judger_version: string;
  service_url: string;
  last_heartbeat: string;
  create_time: string;
  is_disabled: boolean;
  task_number: number;
  cpu_core: number;
  memory: number;
  cpu_usage?: number;
  memory_usage?: number;
};

export default function JudgeServerPage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [servers, setServers] = useState<JudgeServer[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getJudgeServer();
      const data = res.data.data as {
        servers?: JudgeServer[];
        token?: string;
      } | JudgeServer[] | null;
      if (Array.isArray(data)) {
        setServers(data);
      } else if (data && typeof data === "object") {
        setServers(Array.isArray(data.servers) ? data.servers : []);
        if (data.token) setToken(data.token);
      } else {
        setServers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (hostname: string) => {
    if (!confirm("Delete?")) return;
    await adminApi.deleteJudgeServer(hostname);
    toast.success(tm("Success"));
    load();
  };

  const updateToken = async () => {
    await adminApi.updateJudgeServer({ token });
    toast.success(tm("Success"));
  };

  return (
    <div className="space-y-4">
      <GlassPanel title={t("Judge_Server_Token")}>
        <div className="flex max-w-lg gap-2">
          <Input value={token} onChange={(e) => setToken(e.target.value)} />
          <Button onClick={updateToken}>{tm("Save")}</Button>

        </div>

      </GlassPanel>

      <GlassPanel title={t("Judge_Server_Info")}>
        {loading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted">
                  <th className="pb-3 pr-2">Hostname</th>

                  <th className="pb-3 pr-2">{t("IP")}</th>

                  <th className="pb-3 pr-2">{t("Judger_Version")}</th>

                  <th className="pb-3 pr-2">{t("Service_URL")}</th>

                  <th className="pb-3 pr-2">{t("Last_Heartbeat")}</th>

                  <th className="pb-3 pr-2">Status</th>

                  <th className="pb-3">Actions</th>

                </tr>

              </thead>

              <tbody>
                {servers.map((s, i) => (
                  <tr
                    key={`${s.id ?? "x"}-${s.hostname ?? ""}-${s.service_url ?? ""}-${s.ip ?? ""}-${i}`}
                    className="border-b border-white/5"
                  >
                    <td className="py-2 pr-2">{s.hostname}</td>

                    <td className="py-2 pr-2">{s.ip}</td>

                    <td className="py-2 pr-2">{s.judger_version}</td>

                    <td className="py-2 pr-2 text-xs">{s.service_url}</td>

                    <td className="py-2 pr-2 text-muted text-xs">
                      {utcToLocal(s.last_heartbeat)}
                    </td>

                    <td className="py-2 pr-2">
                      <Badge variant={s.is_disabled ? "danger" : "success"}>
                        {s.is_disabled ? "Disabled" : "Normal"}
                      </Badge>

                    </td>

                    <td className="py-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(s.hostname)}
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

    </div>

  );
}
