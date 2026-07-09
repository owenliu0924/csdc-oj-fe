"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Paintbrush,
  Moon,
  Sun,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Upload,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppearanceStore } from "@/stores/appearance";
import {
  BUILT_IN_BACKGROUNDS,
  GRADIENT_BG_ID,
  SOLID_BG_ID,
} from "@/lib/backgrounds";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function SliderRow({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="tabular-nums text-[var(--fg-secondary)]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="appearance-slider w-full"
      />
    </div>
  );
}

function normalizeHex(value: string, fallback = "#000000") {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return value;
  if (/^[0-9A-Fa-f]{6}$/.test(value)) return `#${value}`;
  return fallback;
}

function PrettyColorPicker({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = normalizeHex(value);
  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-[11px] font-medium text-[var(--muted)]">{label}</p>
      ) : null}
      <HexColorPicker
        color={hex}
        onChange={onChange}
        className="!w-full oj-color-picker"
      />
      <div className="flex items-center gap-2">
        <span
          className="h-7 w-7 shrink-0 rounded-md border border-white/15 shadow-inner"
          style={{ background: hex }}
        />
        <HexColorInput
          color={hex}
          onChange={onChange}
          prefixed
          className="h-7 min-w-0 flex-1 rounded-lg border border-[var(--glass-border)] bg-white/[0.06] px-2 font-mono text-xs uppercase text-foreground outline-none focus:border-[var(--pink)]/50"
        />
      </div>
    </div>
  );
}

/** First click selects; second click opens drag color picker. */
function SolidBgThumb({
  color,
  selected,
  onSelect,
  onColorChange,
}: {
  color: string;
  selected: boolean;
  onSelect: () => void;
  onColorChange: (v: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!selected) setPickerOpen(false);
  }, [selected]);

  return (
    <Popover.Root
      modal={false}
      open={selected && pickerOpen}
      onOpenChange={(next) => {
        if (!selected) {
          onSelect();
          setPickerOpen(false);
          return;
        }
        setPickerOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          title={selected ? "再點一次開啟取色器" : "純色"}
          className={cn(
            "group relative block h-14 w-full overflow-hidden rounded-lg border-2 transition-all",
            selected
              ? "border-[var(--pink)] ring-2 ring-[var(--pink-soft)]"
              : "border-transparent opacity-80 hover:opacity-100"
          )}
        >
          <span
            className="absolute inset-0"
            style={{ background: normalizeHex(color) }}
          />
          <span className="absolute inset-x-0 bottom-0 bg-black/45 px-1.5 py-0.5 text-left text-[10px] font-medium text-white/90">
            純色{selected ? " · 點開取色" : ""}
          </span>
          {selected && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--pink)] text-[var(--pink-fg)]">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="left"
          align="start"
          sideOffset={10}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[120] w-[220px] rounded-2xl border border-white/12 bg-[rgba(22,18,28,0.96)] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <PrettyColorPicker value={color} onChange={onColorChange} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function GradientBgThumb({
  from,
  to,
  angle,
  selected,
  onSelect,
  onFromChange,
  onToChange,
  onAngleChange,
}: {
  from: string;
  to: string;
  angle: number;
  selected: boolean;
  onSelect: () => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onAngleChange: (v: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tab, setTab] = useState<"from" | "to">("from");

  useEffect(() => {
    if (!selected) setPickerOpen(false);
  }, [selected]);

  return (
    <Popover.Root
      modal={false}
      open={selected && pickerOpen}
      onOpenChange={(next) => {
        if (!selected) {
          onSelect();
          setPickerOpen(false);
          return;
        }
        setPickerOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          title={selected ? "再點一次開啟取色器" : "漸層"}
          className={cn(
            "group relative block h-14 w-full overflow-hidden rounded-lg border-2 transition-all",
            selected
              ? "border-[var(--pink)] ring-2 ring-[var(--pink-soft)]"
              : "border-transparent opacity-80 hover:opacity-100"
          )}
        >
          <span
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${angle}deg, ${normalizeHex(from)}, ${normalizeHex(to)})`,
            }}
          />
          <span className="absolute inset-x-0 bottom-0 bg-black/45 px-1.5 py-0.5 text-left text-[10px] font-medium text-white/90">
            漸層{selected ? " · 點開取色" : ""}
          </span>
          {selected && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--pink)] text-[var(--pink-fg)]">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="left"
          align="start"
          sideOffset={10}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[120] w-[220px] rounded-2xl border border-white/12 bg-[rgba(22,18,28,0.96)] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-lg bg-white/[0.06] p-0.5">
            <button
              type="button"
              onClick={() => setTab("from")}
              className={cn(
                "rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                tab === "from"
                  ? "bg-[var(--pink-soft)] text-[var(--pink-bright)]"
                  : "text-[var(--muted)] hover:text-foreground"
              )}
            >
              起點
            </button>
            <button
              type="button"
              onClick={() => setTab("to")}
              className={cn(
                "rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                tab === "to"
                  ? "bg-[var(--pink-soft)] text-[var(--pink-bright)]"
                  : "text-[var(--muted)] hover:text-foreground"
              )}
            >
              終點
            </button>
          </div>
          {tab === "from" ? (
            <PrettyColorPicker value={from} onChange={onFromChange} />
          ) : (
            <PrettyColorPicker value={to} onChange={onToChange} />
          )}
          <div className="mt-3">
            <SliderRow
              label="角度"
              value={angle}
              min={0}
              max={360}
              suffix="°"
              onChange={onAngleChange}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function BgThumb({
  preview,
  label,
  selected,
  onSelect,
  onRemove,
}: {
  preview: React.ReactNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onSelect}
        title={label}
        className={cn(
          "relative block h-14 w-full overflow-hidden rounded-lg border-2 transition-all",
          selected
            ? "border-[var(--pink)] ring-2 ring-[var(--pink-soft)]"
            : "border-transparent opacity-80 hover:opacity-100"
        )}
      >
        {preview}
        {selected && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--pink)] text-[var(--pink-fg)]">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
          title="移除"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function AppearancePanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const bgBrightness = useAppearanceStore((s) => s.bgBrightness);
  const bgBlur = useAppearanceStore((s) => s.bgBlur);
  const glassBlur = useAppearanceStore((s) => s.glassBlur);
  const glassTint = useAppearanceStore((s) => s.glassTint);
  const glassMode = useAppearanceStore((s) => s.glassMode);
  const bgSelected = useAppearanceStore((s) => s.bgSelected);
  const customBackgrounds = useAppearanceStore((s) => s.customBackgrounds);
  const uploadedBackgrounds = useAppearanceStore((s) => s.uploadedBackgrounds);
  const bgSolidColor = useAppearanceStore((s) => s.bgSolidColor);
  const bgGradientFrom = useAppearanceStore((s) => s.bgGradientFrom);
  const bgGradientTo = useAppearanceStore((s) => s.bgGradientTo);
  const bgGradientAngle = useAppearanceStore((s) => s.bgGradientAngle);
  const setBgBrightness = useAppearanceStore((s) => s.setBgBrightness);
  const setBgBlur = useAppearanceStore((s) => s.setBgBlur);
  const setGlassBlur = useAppearanceStore((s) => s.setGlassBlur);
  const setGlassTint = useAppearanceStore((s) => s.setGlassTint);
  const setGlassMode = useAppearanceStore((s) => s.setGlassMode);
  const setBgSelected = useAppearanceStore((s) => s.setBgSelected);
  const setBgSolidColor = useAppearanceStore((s) => s.setBgSolidColor);
  const setBgGradientFrom = useAppearanceStore((s) => s.setBgGradientFrom);
  const setBgGradientTo = useAppearanceStore((s) => s.setBgGradientTo);
  const setBgGradientAngle = useAppearanceStore((s) => s.setBgGradientAngle);
  const addCustomBackground = useAppearanceStore((s) => s.addCustomBackground);
  const removeCustomBackground = useAppearanceStore(
    (s) => s.removeCustomBackground
  );
  const addUploadedBackground = useAppearanceStore(
    (s) => s.addUploadedBackground
  );
  const removeUploadedBackground = useAppearanceStore(
    (s) => s.removeUploadedBackground
  );
  const reset = useAppearanceStore((s) => s.reset);

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== "light";
  const solidSelected = bgSelected === SOLID_BG_ID;
  const gradientSelected = bgSelected === GRADIENT_BG_ID;

  const handleAddCustom = () => {
    const ok = addCustomBackground(customUrl);
    if (!ok) {
      toast.error("請輸入有效的圖片直連 URL（http/https）");
      return;
    }
    setCustomUrl("");
    toast.success("已加入背景");
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await addUploadedBackground(file);
      if (!res.ok) {
        toast.error(res.error || "上傳失敗");
        return;
      }
      toast.success("已上傳並套用");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          type="button"
          aria-label="Appearance"
        >
          <Paintbrush className="h-3.5 w-3.5" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[90] max-h-[min(80vh,620px)] w-[300px] overflow-y-auto rounded-2xl glass-float p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-tight">外觀設定</h3>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--glass-hover-bg)] hover:text-foreground"
              title="重設預設值"
            >
              <RotateCcw className="h-3 w-3" />
              重設
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-[var(--muted)]">主題</Label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs transition-colors",
                    isDark
                      ? "border-[var(--pink)]/40 bg-[var(--pink-soft)] text-[var(--pink)]"
                      : "border-[var(--glass-border)] text-[var(--muted)] hover:bg-[var(--glass-hover-bg)]"
                  )}
                >
                  <Moon className="h-3.5 w-3.5" />
                  深色
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs transition-colors",
                    !isDark
                      ? "border-[var(--pink)]/40 bg-[var(--pink-soft)] text-[var(--pink)]"
                      : "border-[var(--glass-border)] text-[var(--muted)] hover:bg-[var(--glass-hover-bg)]"
                  )}
                >
                  <Sun className="h-3.5 w-3.5" />
                  淺色
                </button>
              </div>
            </div>

            <div className="h-px bg-[var(--glass-border)]" />

            <SliderRow
              label="背景亮度"
              value={bgBrightness}
              onChange={setBgBrightness}
            />
            <SliderRow
              label="背景模糊"
              value={bgBlur}
              max={40}
              suffix="px"
              onChange={setBgBlur}
            />
            <SliderRow
              label="元件模糊"
              value={glassBlur}
              max={40}
              suffix="px"
              onChange={setGlassBlur}
            />
            <SliderRow
              label="元件深色遮罩"
              value={glassTint}
              onChange={setGlassTint}
            />

            <div className="h-px bg-[var(--glass-border)]" />

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium">Glass mode</p>
                <p className="text-[11px] text-[var(--muted)]">
                  關閉後為不透明黑底
                </p>
              </div>
              <Switch checked={glassMode} onCheckedChange={setGlassMode} />
            </div>

            <div className="h-px bg-[var(--glass-border)]" />

            <div className="space-y-2.5">
              <Label className="text-xs text-[var(--muted)]">背景圖庫</Label>
              <div className="grid grid-cols-2 gap-2">
                <SolidBgThumb
                  color={bgSolidColor}
                  selected={solidSelected}
                  onSelect={() => setBgSelected(SOLID_BG_ID)}
                  onColorChange={setBgSolidColor}
                />
                <GradientBgThumb
                  from={bgGradientFrom}
                  to={bgGradientTo}
                  angle={bgGradientAngle}
                  selected={gradientSelected}
                  onSelect={() => setBgSelected(GRADIENT_BG_ID)}
                  onFromChange={setBgGradientFrom}
                  onToChange={setBgGradientTo}
                  onAngleChange={setBgGradientAngle}
                />
                {BUILT_IN_BACKGROUNDS.map((bg) => (
                  <BgThumb
                    key={bg.id}
                    label={bg.name}
                    selected={bgSelected === bg.id}
                    onSelect={() => setBgSelected(bg.id)}
                    preview={
                      <img
                        src={bg.src}
                        alt={bg.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    }
                  />
                ))}
                {customBackgrounds.map((url) => (
                  <BgThumb
                    key={url}
                    label={url}
                    selected={bgSelected === url}
                    onSelect={() => setBgSelected(url)}
                    onRemove={() => removeCustomBackground(url)}
                    preview={
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    }
                  />
                ))}
                {uploadedBackgrounds.map((u) => (
                  <BgThumb
                    key={u.id}
                    label={u.name}
                    selected={bgSelected === u.id}
                    onSelect={() => setBgSelected(u.id)}
                    onRemove={() => removeUploadedBackground(u.id)}
                    preview={
                      <img
                        src={u.dataUrl}
                        alt={u.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    }
                  />
                ))}
              </div>

              <div className="flex gap-1.5 pt-0.5">
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://… 圖片直連"
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustom();
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleAddCustom}
                  title="新增直連"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 shrink-0"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  title="上傳圖片"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--faint)]">
                純色／漸層：點選後再點一次可拖曳取色
              </p>
            </div>
          </div>

          <Popover.Arrow className="fill-[var(--glass-3)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
