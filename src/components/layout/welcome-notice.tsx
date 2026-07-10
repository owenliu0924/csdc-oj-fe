"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

const STORAGE_KEY = "csdc-oj-fe:welcome-dismissed-v1";
const GITHUB_URL = "https://github.com/owenliu0924/csdc-oj-fe";

export function WelcomeNotice() {
  const [open, setOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState<string | null>(null);

  useEffect(() => {
    if (storage.get<boolean>(STORAGE_KEY)) return;

    const timer = window.setTimeout(() => setOpen(true), 400);

    fetch("/api/fe-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { backendUrl?: string | null } | null) => {
        if (data?.backendUrl) setBackendUrl(data.backendUrl.replace(/\/$/, ""));
      })
      .catch(() => {});

    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    storage.set(STORAGE_KEY, true);
    setOpen(false);
  };

  const goOld = () => {
    if (!backendUrl) return;
    storage.set(STORAGE_KEY, true);
    window.location.href = backendUrl;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) dismiss();
      }}
    >
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="relative border-b border-white/10 px-6 pb-5 pt-7">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg tracking-tight">
              歡迎體驗新版 OJ 前端
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[var(--fg-secondary)]">
              目前還在測試中，若遇到問題或有建議，歡迎到 GitHub
              回報。你也可以隨時回到舊版介面。
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm transition-colors hover:border-[var(--pink)]/40 hover:bg-[var(--pink-soft)]"
          >
            <span className="min-w-0 flex-1 truncate text-left">
              在 GitHub 查看專案
              <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
                github.com/owenliu0924/csdc-oj-fe
              </span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </a>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              disabled={!backendUrl}
              onClick={goOld}
            >
              回到舊版
            </Button>
            <Button type="button" className="sm:flex-1" onClick={dismiss}>
              開始體驗
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
