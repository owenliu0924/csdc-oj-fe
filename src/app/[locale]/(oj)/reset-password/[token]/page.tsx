"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const t = useTranslations("m");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
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
    if (password !== again) {
      toast.error(t("password_does_not_match"));
      return;
    }
    await ojApi.resetPassword({
      token,
      password,
      captcha,
      captcha_key: captchaKey,
    });
    toast.success(t("Your_password_has_been_reset"));
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-md">
      <GlassPanel title={t("Reset_Password")}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("RPassword")}</Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("RPassword_Again")}</Label>

            <Input
              type="password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
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
            {t("Reset_Password")}
          </Button>

        </div>

      </GlassPanel>

    </div>

  );
}
