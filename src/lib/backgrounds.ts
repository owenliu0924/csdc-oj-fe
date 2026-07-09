export type BuiltInBackground = {
  id: string;
  name: string;
  src: string;
};

export const BUILT_IN_BACKGROUNDS: BuiltInBackground[] = [
  {
    id: "unsplash",
    name: "Unsplash",
    src: "/backgrounds/unsplash.jpg",
  },
  {
    id: "illust-67860933",
    name: "Illust A",
    src: "/backgrounds/illust-67860933.jpg",
  },
  {
    id: "illust-126955136",
    name: "Illust B",
    src: "/backgrounds/illust-126955136.jpg",
  },
  {
    id: "illust-107696636",
    name: "Illust C",
    src: "/backgrounds/illust-107696636.jpg",
  },
];

export const DEFAULT_BG_ID = "unsplash";
export const DEFAULT_BG_URL = "/backgrounds/unsplash.jpg";

export const SOLID_BG_ID = "solid";
export const GRADIENT_BG_ID = "gradient";

export const DEFAULT_SOLID_COLOR = "#1a1020";
export const DEFAULT_GRADIENT_FROM = "#1a1020";
export const DEFAULT_GRADIENT_TO = "#e89ab8";
export const DEFAULT_GRADIENT_ANGLE = 135;

export const BG_COOKIE = "csdc-oj-bg";
export const UPLOAD_PREFIX = "upload:";

export type UploadedBackground = {
  id: string;
  name: string;
  dataUrl: string;
};

export type BgCookieData = {
  selected: string;
  custom: string[];
};

export const MAX_UPLOADS = 6;

export function isUploadId(id: string): boolean {
  return id.startsWith(UPLOAD_PREFIX);
}

export function isSolidBg(id: string): boolean {
  return id === SOLID_BG_ID;
}

export function isGradientBg(id: string): boolean {
  return id === GRADIENT_BG_ID;
}

export function isCssBg(id: string): boolean {
  return isSolidBg(id) || isGradientBg(id);
}

export function resolveBgUrl(
  selected: string,
  custom: string[] = [],
  uploads: UploadedBackground[] = []
): string | null {
  if (isCssBg(selected)) return null;

  const builtIn = BUILT_IN_BACKGROUNDS.find((b) => b.id === selected);
  if (builtIn) return builtIn.src;

  if (isUploadId(selected)) {
    const u = uploads.find((x) => x.id === selected);
    if (u) return u.dataUrl;
  }

  if (custom.includes(selected) || /^https?:\/\//i.test(selected)) {
    return selected;
  }

  if (selected.startsWith("data:image/")) return selected;

  return DEFAULT_BG_URL;
}

export function resolveBgCss(state: {
  bgSelected: string;
  bgSolidColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgGradientAngle: number;
}): string | null {
  if (isSolidBg(state.bgSelected)) {
    return state.bgSolidColor || DEFAULT_SOLID_COLOR;
  }
  if (isGradientBg(state.bgSelected)) {
    const angle = Number.isFinite(state.bgGradientAngle)
      ? state.bgGradientAngle
      : DEFAULT_GRADIENT_ANGLE;
    const from = state.bgGradientFrom || DEFAULT_GRADIENT_FROM;
    const to = state.bgGradientTo || DEFAULT_GRADIENT_TO;
    return `linear-gradient(${angle}deg, ${from}, ${to})`;
  }
  return null;
}

export function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function readBgCookie(): BgCookieData {
  if (typeof document === "undefined") {
    return { selected: DEFAULT_BG_ID, custom: [] };
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${BG_COOKIE}=([^;]*)`)
  );
  if (!match) return { selected: DEFAULT_BG_ID, custom: [] };
  try {
    const data = JSON.parse(decodeURIComponent(match[1])) as BgCookieData;
    return {
      selected: data.selected || DEFAULT_BG_ID,
      custom: Array.isArray(data.custom) ? data.custom.filter(isHttpUrl) : [],
    };
  } catch {
    return { selected: DEFAULT_BG_ID, custom: [] };
  }
}

export function writeBgCookie(data: BgCookieData) {
  if (typeof document === "undefined") return;
  const custom = data.custom.filter(isHttpUrl).slice(0, 12);

  let selected = data.selected;
  if (selected.startsWith("data:")) {
    selected = DEFAULT_BG_ID;
  }
  let payload = { selected, custom };
  let encoded = encodeURIComponent(JSON.stringify(payload));
  while (encoded.length > 3500 && payload.custom.length > 0) {
    payload = { ...payload, custom: payload.custom.slice(1) };
    encoded = encodeURIComponent(JSON.stringify(payload));
  }
  document.cookie = `${BG_COOKIE}=${encoded};path=/;max-age=${
    60 * 60 * 24 * 365
  };samesite=lax`;
}

const MAX_UPLOAD_EDGE = 1920;
const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024;

export function fileToBackgroundDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not-image"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const raw = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > MAX_UPLOAD_BYTES && quality > 0.45) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        if (dataUrl.length > MAX_UPLOAD_BYTES * 1.4) {
          reject(new Error("too-large"));
          return;
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("decode-failed"));
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}
