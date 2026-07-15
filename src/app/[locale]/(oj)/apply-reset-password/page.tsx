"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ojApi from "@/lib/api/oj";
import { parseCaptchaData } from "@/lib/captcha";

export default function ApplyResetPasswordPage() {
  const t = useTranslations("m");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCaptcha = async () => {
    try {
      const res = await ojApi.getCaptcha();
      const { captchaKey: key, captchaImg: img } = parseCaptchaData(
        res.data.data
      );
      setCaptchaKey(key);
      setCaptchaImg(img);
    } catch {
      /* ajax toasts */
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const submit = async () => {
    if (!captcha.trim()) {
      toast.error(t("CaptchaRequired"));
      return;
    }
    setLoading(true);
    try {
      await ojApi.applyResetPassword({
        email,
        captcha,
        ...(captchaKey ? { captcha_key: captchaKey } : {}),
      });
      toast.success(t("Password_reset_mail_sent"));
    } catch {
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <GlassPanel title={t("Reset_Password")}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("ApplyEmail")}</Label>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("RCaptcha")}</Label>

            <div className="flex gap-2">
              <Input
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                autoComplete="off"
              />
              {captchaImg ? (
                <img
                  src={captchaImg}
                  alt="captcha"
                  className="h-9 cursor-pointer rounded-md"
                  onClick={loadCaptcha}
                  title={t("ClickToRefreshCaptcha")}
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={loadCaptcha}
                >
                  {t("RefreshCaptcha")}
                </Button>
              )}
            </div>
          </div>

          <Button className="w-full" onClick={submit} disabled={loading}>
            {t("Send_Password_Reset_Email")}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
