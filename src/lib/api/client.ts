import axios, { type AxiosRequestConfig } from "axios";
import { getCookie } from "@/lib/utils";
import { toast } from "sonner";

export type ApiResponse<T = unknown> = {
  error: string | null;
  data: T;
};

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

apiClient.interceptors.request.use((config) => {
  const csrf = getCookie("csrftoken");
  if (csrf) {
    config.headers.set("X-CSRFToken", csrf);
  }
  return config;
});

type LoginHandler = () => void;
let onNeedLogin: LoginHandler | null = null;

export function setNeedLoginHandler(handler: LoginHandler | null) {
  onNeedLogin = handler;
}

export async function ensureCsrfCookie(): Promise<void> {
  try {
    await apiClient.get("profile", { withCredentials: true });
  } catch {

  }
}

export async function ajax<T = unknown>(
  url: string,
  method: string,
  options?: {
    params?: Record<string, unknown>;
    data?: unknown;
    silent?: boolean;
    responseType?: AxiosRequestConfig["responseType"];
  }
): Promise<{ data: ApiResponse<T>; headers: Record<string, string> }> {
  const { params = {}, data = {}, silent = false, responseType } = options ?? {};
  try {

    const m = method.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(m) && !getCookie("csrftoken")) {
      await ensureCsrfCookie();
    }

    const res = await apiClient.request({
      url,
      method,
      params,
      data,
      responseType,
    });

    if (responseType === "blob") {
      return {
        data: res.data as ApiResponse<T>,
        headers: res.headers as Record<string, string>,
      };
    }

    const body = res.data as ApiResponse<T>;
    if (body && typeof body === "object" && "error" in body && body.error !== null) {
      const message =
        typeof body.data === "string" ? body.data : JSON.stringify(body.data);
      if (!silent) toast.error(message || "Request failed");
      if (typeof body.data === "string" && body.data.startsWith("Please login")) {
        onNeedLogin?.();
      }
      throw Object.assign(new Error(message), { response: res, api: body });
    }
    return {
      data: body,
      headers: res.headers as Record<string, string>,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 403) {
        if (!silent) {
          toast.error("CSRF / 權限錯誤 (403)。正在重新取得 token…");
        }
        await ensureCsrfCookie();
      } else if (err.response?.data) {
        const msg =
          (err.response.data as { data?: string })?.data ||
          err.message ||
          "Network error";
        if (!silent) toast.error(typeof msg === "string" ? msg : "Network error");
      } else if (!silent) {
        toast.error(err.message || "Network error");
      }
    }
    throw err;
  }
}

export default apiClient;
