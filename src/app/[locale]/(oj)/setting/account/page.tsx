"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ojApi from "@/lib/api/oj";

export default function AccountSettingPage() {
  const t = useTranslations("m");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [again, setAgain] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [tfaCode, setTfaCode] = useState("");

  const changePassword = async () => {
    if (newPassword !== again) {
      toast.error(t("password_does_not_match"));
      return;
    }
    await ojApi.changePassword({
      old_password: oldPassword,
      new_password: newPassword,
    });
    toast.success(t("Success"));
    setOldPassword("");
    setNewPassword("");
    setAgain("");
  };

  const changeEmail = async () => {
    await ojApi.changeEmail({
      password,
      email,
      tfa_code: tfaCode || undefined,
    });
    toast.success(t("Success"));
  };

  return (
    <div className="space-y-4">
      <GlassPanel title={t("ChangePassword")}>
        <div className="max-w-sm space-y-3">
          <div className="space-y-2">
            <Label>Old Password</Label>

            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("RPassword")}</Label>

            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <Button onClick={changePassword}>{t("Update_Password")}</Button>

        </div>

      </GlassPanel>

      <GlassPanel title={t("ChangeEmail")}>
        <div className="max-w-sm space-y-3">
          <div className="space-y-2">
            <Label>{t("LoginPassword")}</Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Email_Address")}</Label>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("TFA_Code")}</Label>

            <Input value={tfaCode} onChange={(e) => setTfaCode(e.target.value)} />
          </div>

          <Button onClick={changeEmail}>{t("Save")}</Button>

        </div>

      </GlassPanel>

    </div>

  );
}
