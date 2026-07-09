"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModalStore } from "@/stores/auth-modal";
import { useWebsiteStore } from "@/stores/website";
import { AuthForm } from "@/components/oj/auth-form";

export function AuthModal() {
  const t = useTranslations("m");
  const visible = useAuthModalStore((s) => s.visible);
  const mode = useAuthModalStore((s) => s.mode);
  const close = useAuthModalStore((s) => s.close);
  const setMode = useAuthModalStore((s) => s.setMode);
  const website = useWebsiteStore((s) => s.website);

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Welcome_to")}{" "}
            {website.website_name_shortcut ||
              website.website_name ||
              "OJ"}
          </DialogTitle>

          <DialogDescription className="sr-only">
            {mode === "login" ? t("UserLogin") : t("UserRegister")}
          </DialogDescription>

        </DialogHeader>

        <AuthForm
          mode={mode}
          onModeChange={setMode}
          onSuccess={close}
        />
      </DialogContent>

    </Dialog>

  );
}
