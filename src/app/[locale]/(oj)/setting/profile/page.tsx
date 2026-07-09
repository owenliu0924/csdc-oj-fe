"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/stores/user";
import ojApi from "@/lib/api/oj";
import apiClient from "@/lib/api/client";
import { getCookie } from "@/lib/utils";

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

export default function ProfileSettingPage() {
  const t = useTranslations("m");
  const profile = useUserStore((s) => s.profile);
  const getProfile = useUserStore((s) => s.getProfile);

  const [realName, setRealName] = useState(profile.real_name || "");
  const [mood, setMood] = useState((profile.mood as string) || "");
  const [school, setSchool] = useState(profile.school || "");
  const [major, setMajor] = useState(profile.major || "");
  const [language, setLanguage] = useState(profile.language || "zh-TW");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const saveProfile = async () => {
    await ojApi.updateProfile({
      real_name: realName,
      mood,
      school,
      major,
      language,
    });
    toast.success(t("Success"));
    getProfile();
  };

  const uploadAvatar = async () => {
    if (!imgSrc || !croppedArea) return;
    const blob = await getCroppedImg(imgSrc, croppedArea);
    const form = new FormData();
    form.append("image", blob, "avatar.jpg");
    const csrf = getCookie("csrftoken");
    await apiClient.post("upload_avatar", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
    });
    toast.success(t("Success"));
    setImgSrc(null);
    getProfile();
  };

  return (
    <div className="space-y-4">
      <GlassPanel title={t("Avatar_Setting")}>
        {!imgSrc ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-10 text-sm text-muted hover:bg-white/[0.05]">
            Drop here, or click to select
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => setImgSrc(String(reader.result));
                reader.readAsDataURL(f);
              }}
            />
          </label>

        ) : (
          <div className="space-y-3">
            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-black/40">
              <Cropper
                image={imgSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setImgSrc(null)}>
                {t("Cancel")}
              </Button>

              <Button onClick={uploadAvatar}>{t("Save")}</Button>

            </div>

          </div>

        )}
      </GlassPanel>

      <GlassPanel title={t("Profile_Setting")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Real Name</Label>

            <Input value={realName} onChange={(e) => setRealName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>

            <Input value={mood} onChange={(e) => setMood(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>School</Label>

            <Input value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Major</Label>

            <Input value={major} onChange={(e) => setMajor(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("Language")}</Label>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="zh-TW">繁體中文</SelectItem>

                <SelectItem value="en-US">English</SelectItem>

              </SelectContent>

            </Select>

          </div>

        </div>

        <Button className="mt-4" onClick={saveProfile}>
          {t("Save")}
        </Button>

      </GlassPanel>

    </div>

  );
}
