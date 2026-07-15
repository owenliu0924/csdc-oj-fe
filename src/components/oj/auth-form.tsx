"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/user";
import { useWebsiteStore } from "@/stores/website";
import ojApi from "@/lib/api/oj";
import { parseCaptchaData } from "@/lib/captcha";
import { Link } from "@/i18n/navigation";
import { springSoft } from "@/lib/motion";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
  onModeChange?: (mode: Mode) => void;
  onSuccess?: () => void;

  showSwitch?: boolean;
};

export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  showSwitch = true,
}: Props) {
  const t = useTranslations("m");
  const getProfile = useUserStore((s) => s.getProfile);
  const website = useWebsiteStore((s) => s.website);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [needTfa, setNeedTfa] = useState(false);
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
      /* ajax may toast */
    }
  };

  useEffect(() => {
    if (mode === "register") loadCaptcha();
    setNeedTfa(false);
    setTfaCode("");
  }, [mode]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!needTfa) {
        const tfaRes = await ojApi.tfaRequiredCheck(username);
        if ((tfaRes.data.data as { result: boolean }).result) {
          setNeedTfa(true);
          setLoading(false);
          return;
        }
      }
      await ojApi.login({
        username,
        password,
        ...(needTfa ? { tfa_code: tfaCode } : {}),
      });
      toast.success(t("Welcome_back"));
      await getProfile();
      onSuccess?.();
    } catch {

    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password !== password2) {
      toast.error(t("password_does_not_match"));
      return;
    }
    setLoading(true);
    try {
      await ojApi.register({
        username,
        password,
        email,
        captcha,
        ...(captchaKey ? { captcha_key: captchaKey } : {}),
      });
      toast.success(t("Thanks_for_registering"));
      onModeChange?.("login");
      setPassword("");
      setPassword2("");
      setCaptcha("");
    } catch {
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode === "login" ? (
        <motion.div
          key="login"
          className="space-y-4"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={springSoft}
        >
          <div className="space-y-2">
            <Label>{t("LoginUsername")}</Label>

            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("LoginPassword")}</Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <AnimatePresence>
            {needTfa && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={springSoft}
              >
                <Label>{t("TFA_Code")}</Label>

                <Input
                  value={tfaCode}
                  onChange={(e) => setTfaCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </motion.div>

            )}
          </AnimatePresence>

          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {t("UserLogin")}
          </Button>

          {showSwitch && (
            <div className="flex justify-between text-sm text-muted">
              <Link
                href="/apply-reset-password"
                className="hover:text-[var(--pink-bright)] transition-colors"
              >
                {t("Forget_Password")}
              </Link>

              {website.allow_register !== false && (
                <button
                  type="button"
                  className="hover:text-[var(--pink-bright)] transition-colors"
                  onClick={() => onModeChange?.("register")}
                >
                  {t("No_Account")}
                </button>

              )}
            </div>

          )}
        </motion.div>

      ) : (
        <motion.div
          key="register"
          className="space-y-4"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={springSoft}
        >
          <div className="space-y-2">
            <Label>{t("RegisterUsername")}</Label>

            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            <Label>{t("RegisterPassword")}</Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Password_Again")}</Label>

            <Input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Captcha")}</Label>

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
                  className="h-9 cursor-pointer rounded-lg border border-white/10"
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

          <Button className="w-full" onClick={handleRegister} disabled={loading}>
            {t("UserRegister")}
          </Button>

          {showSwitch && (
            <button
              type="button"
              className="w-full text-sm text-muted hover:text-[var(--pink-bright)] transition-colors"
              onClick={() => onModeChange?.("login")}
            >
              {t("Already_Registed")}
            </button>

          )}
        </motion.div>

      )}
    </AnimatePresence>

  );
}
