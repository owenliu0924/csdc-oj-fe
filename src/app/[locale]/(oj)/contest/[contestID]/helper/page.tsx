"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/oj/loading";
import ojApi from "@/lib/api/oj";
import { secondFormat } from "@/lib/time";

type ACInfo = {
  id: number;
  username: string;
  problem_display_id: string;
  ac_info: { ac_time: number; is_first_blood: boolean };
  checked: boolean;
};

export default function ACMHelperPage({
  params,
}: {
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const [list, setList] = useState<ACInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ojApi.getACMACInfo({ contest_id: contestID });
      setList((res.data.data as ACInfo[]) || []);
    } finally {
      setLoading(false);
    }
  }, [contestID]);

  useEffect(() => {
    load();
  }, [load]);

  const check = async (id: number) => {
    await ojApi.updateACInfoCheckedStatus({ id, checked: true });
    toast.success(t("Success"));
    load();
  };

  if (loading) return <Loading />;

  return (
    <GlassPanel title={t("ACM_Helper")}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-muted">
            <th className="pb-3 pr-3">{t("Username")}</th>

            <th className="pb-3 pr-3">{t("ProblemID")}</th>

            <th className="pb-3 pr-3">{t("AC_Time")}</th>

            <th className="pb-3 pr-3">{t("First_Blood")}</th>

            <th className="pb-3">{t("Option")}</th>

          </tr>

        </thead>

        <tbody>
          {list.map((row) => (
            <tr key={row.id} className="border-b border-white/5">
              <td className="py-3 pr-3">{row.username}</td>

              <td className="py-3 pr-3">{row.problem_display_id}</td>

              <td className="py-3 pr-3 font-mono text-xs">
                {secondFormat(row.ac_info?.ac_time || 0)}
              </td>

              <td className="py-3 pr-3">
                {row.ac_info?.is_first_blood ? (
                  <Badge variant="warning">{t("First_Blood")}</Badge>

                ) : (
                  "—"
                )}
              </td>

              <td className="py-3">
                {row.checked ? (
                  <Badge variant="success">{t("Checked")}</Badge>

                ) : (
                  <Button size="sm" onClick={() => check(row.id)}>
                    {t("Check_It")}
                  </Button>

                )}
              </td>

            </tr>

          ))}
        </tbody>

      </table>

    </GlassPanel>

  );
}
