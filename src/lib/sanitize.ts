/**
 * Client-side HTML sanitizer.
 * Uses browser DOMPurify (not isomorphic-dompurify/jsdom) so the
 * Cloudflare Worker / Node server bundle stays small.
 */
import DOMPurify from "dompurify";

export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Should only be called from client components; strip tags as a safe fallback.
    return dirty.replace(/<[^>]*>/g, "");
  }
  return DOMPurify.sanitize(dirty);
}
