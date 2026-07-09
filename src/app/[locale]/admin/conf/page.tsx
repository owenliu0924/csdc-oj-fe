"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/oj/loading";
import adminApi from "@/lib/api/admin";

export default function AdminConfPage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [loading, setLoading] = useState(true);
  const [smtp, setSmtp] = useState({
    server: "",
    port: 465,
    email: "",
    password: "",
    tls: true,
  });
  const [hasSmtp, setHasSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [website, setWebsite] = useState({
    website_base_url: "",
    website_name: "",
    website_name_shortcut: "",
    website_footer: "",
    allow_register: true,
    submission_list_show_all: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [s, w] = await Promise.all([
          adminApi.getSMTPConfig().catch(() => null),
          adminApi.getWebsiteConfig(),
        ]);
        if (s?.data?.data) {
          setSmtp({ ...(s.data.data as typeof smtp) });
          setHasSmtp(true);
        }
        if (w.data.data) setWebsite({ ...(w.data.data as typeof website) });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSmtp = async () => {
    if (hasSmtp) await adminApi.editSMTPConfig(smtp);
    else {
      await adminApi.createSMTPConfig(smtp);
      setHasSmtp(true);
    }
    toast.success(tm("Success"));
  };

  const testSmtp = async () => {
    await adminApi.testSMTPConfig(testEmail);
    toast.success(tm("Success"));
  };

  const saveWebsite = async () => {
    await adminApi.editWebsiteConfig(website);
    toast.success(tm("Success"));
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <GlassPanel title={t("SMTP_Config")}>
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t("Server")}</Label>

            <Input value={smtp.server} onChange={(e) => setSmtp({ ...smtp, server: e.target.value })} />
          </div>

          <div className="space-y-1">
            <Label>{t("Port")}</Label>

            <Input type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })} />
          </div>

          <div className="space-y-1">
            <Label>{t("Email")}</Label>

            <Input value={smtp.email} onChange={(e) => setSmtp({ ...smtp, email: e.target.value })} />
          </div>

          <div className="space-y-1">
            <Label>{t("Password")}</Label>

            <Input type="password" value={smtp.password} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} />
          </div>

        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={saveSmtp}>{tm("Save")}</Button>

          <Input className="w-48" placeholder="test email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
          <Button variant="secondary" onClick={testSmtp}>Test</Button>

        </div>

      </GlassPanel>

      <GlassPanel title={t("Website_Config")}>
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label>{t("Base_Url")}</Label>

            <Input value={website.website_base_url} onChange={(e) => setWebsite({ ...website, website_base_url: e.target.value })} />
          </div>

          <div className="space-y-1">
            <Label>{t("Name")}</Label>

            <Input value={website.website_name} onChange={(e) => setWebsite({ ...website, website_name: e.target.value })} />
          </div>

          <div className="space-y-1">
            <Label>{t("Shortcut")}</Label>

            <Input value={website.website_name_shortcut} onChange={(e) => setWebsite({ ...website, website_name_shortcut: e.target.value })} />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>{t("Footer")}</Label>

            <Textarea value={website.website_footer} onChange={(e) => setWebsite({ ...website, website_footer: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Switch checked={website.allow_register} onCheckedChange={(v) => setWebsite({ ...website, allow_register: v })} />
            {t("Allow_Register")}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Switch checked={website.submission_list_show_all} onCheckedChange={(v) => setWebsite({ ...website, submission_list_show_all: v })} />
            {t("Submission_List_Show_All")}
          </label>

        </div>

        <Button className="mt-4" onClick={saveWebsite}>{tm("Save")}</Button>

      </GlassPanel>

    </div>

  );
}
