"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ojApi from "@/lib/api/oj";

export default function ApplyResetPasswordPage() {
  const t = useTranslations("m");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");

  const loadCaptcha = async () => {
    const res = await ojApi.getCaptcha();
    const data = res.data.data as { captcha_key: string; captcha_image: string };
    setCaptchaKey(data.captcha_key);
    setCaptchaImg(data.captcha_image);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const submit = async () => {
    await ojApi.applyResetPassword({
      email,
      captcha,
      captcha_key: captchaKey,
    });
    toast.success(t("Password_reset_mail_sent"));
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
              <Input value={captcha} onChange={(e) => setCaptcha(e.target.value)} />
              {captchaImg && (

                <img
                  src={captchaImg}
                  alt="captcha"
                  className="h-9 cursor-pointer rounded-md"
                  onClick={loadCaptcha}
                />
              )}
            </div>

          </div>

          <Button className="w-full" onClick={submit}>
            {t("Send_Password_Reset_Email")}
          </Button>

        </div>

      </GlassPanel>

    </div>

  );
}
