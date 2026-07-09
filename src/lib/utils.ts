import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function submissionMemoryFormat(memory?: number | string): string {
  if (memory === undefined || memory === null) return "--";
  const t = parseInt(String(memory), 10) / 1048576;
  return `${t.toFixed(0)}MB`;
}

export function submissionTimeFormat(time?: number | string): string {
  if (time === undefined || time === null) return "--";
  return `${time}ms`;
}

export function getACRate(acCount: number, totalCount: number): string {
  const rate = totalCount === 0 ? 0 : (acCount / totalCount) * 100;
  return `${rate.toFixed(2)}%`;
}

export function filterEmptyValue<T extends Record<string, unknown>>(
  object: T
): Partial<T> {
  const query: Partial<T> = {};
  Object.keys(object).forEach((key) => {
    const k = key as keyof T;
    const v = object[k];
    if (v || v === 0 || v === false) {
      query[k] = v;
    }
  });
  return query;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const raw of cookies) {
    const part = raw.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1));
      } catch {
        return part.slice(eq + 1);
      }
    }
  }
  return null;
}

export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(link.href);
}
