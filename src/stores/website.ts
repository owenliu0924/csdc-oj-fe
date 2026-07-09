"use client";

import { create } from "zustand";
import ojApi from "@/lib/api/oj";

export type WebsiteConfig = {
  website_name?: string;
  website_name_shortcut?: string;
  website_footer?: string;
  allow_register?: boolean;
  submission_list_show_all?: boolean;
  [key: string]: unknown;
};

type WebsiteState = {
  website: WebsiteConfig;
  getWebsiteConfig: () => Promise<void>;
};

export const useWebsiteStore = create<WebsiteState>((set) => ({
  website: {},
  getWebsiteConfig: async () => {
    try {
      const res = await ojApi.getWebsiteConf();
      set({ website: (res.data.data as WebsiteConfig) || {} });
    } catch {

    }
  },
}));
