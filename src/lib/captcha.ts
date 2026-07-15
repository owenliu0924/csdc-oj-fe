/**
 * Normalize OnlineJudge captcha API payloads.
 *
 * Classic QingdaoU OJ returns `data` as a base64 data-URI string (session captcha).
 * Some forks return `{ captcha_key, captcha_image }` or `{ captcha }`.
 */
export type CaptchaPayload = {
  captchaKey: string;
  captchaImg: string;
};

export function parseCaptchaData(data: unknown): CaptchaPayload {
  if (typeof data === "string" && data) {
    return { captchaKey: "", captchaImg: data };
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const img =
      (typeof o.captcha_image === "string" && o.captcha_image) ||
      (typeof o.captcha === "string" && o.captcha) ||
      (typeof o.image === "string" && o.image) ||
      "";
    const key =
      (typeof o.captcha_key === "string" && o.captcha_key) ||
      (typeof o.key === "string" && o.key) ||
      "";
    return { captchaKey: key, captchaImg: img };
  }
  return { captchaKey: "", captchaImg: "" };
}
