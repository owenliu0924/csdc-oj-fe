"use client";

import { create } from "zustand";
import ojApi from "@/lib/api/oj";
import { storage } from "@/lib/storage";
import {
  PROBLEM_PERMISSION,
  STORAGE_KEY,
  USER_TYPE,
} from "@/lib/constants";

export type User = {
  id?: number;
  username?: string;
  admin_type?: string;
  problem_permission?: string;
  email?: string;
  [key: string]: unknown;
};

export type Profile = {
  user?: User;
  real_name?: string;
  avatar?: string;
  mood?: string;
  school?: string;
  major?: string;
  language?: string;
  acm_problems_status?: { problems: Record<string, { status: number }> };
  oi_problems_status?: {
    problems: Record<string, { status: number; score?: number }>;
  };
  accepted_number?: number;
  submission_number?: number;
  total_score?: number;
  [key: string]: unknown;
};

type UserState = {
  profile: Profile;
  loaded: boolean;
  getProfile: (username?: string) => Promise<void>;
  clearProfile: () => void;
  setProfile: (profile: Profile) => void;
  isAuthenticated: () => boolean;
  isAdminRole: () => boolean;
  isSuperAdmin: () => boolean;
  hasProblemPermission: () => boolean;
  user: () => User;
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: {},
  loaded: false,
  user: () => get().profile.user || {},
  isAuthenticated: () => !!get().profile.user?.id,
  isAdminRole: () => {
    const t = get().profile.user?.admin_type;
    return t === USER_TYPE.ADMIN || t === USER_TYPE.SUPER_ADMIN;
  },
  isSuperAdmin: () => get().profile.user?.admin_type === USER_TYPE.SUPER_ADMIN,
  hasProblemPermission: () =>
    get().profile.user?.problem_permission !== PROBLEM_PERMISSION.NONE,
  setProfile: (profile) => {
    set({ profile, loaded: true });
    storage.set(STORAGE_KEY.AUTHED, !!profile.user);
  },
  getProfile: async (username?: string) => {
    try {
      const res = await ojApi.getUserInfo(username);
      const profile = (res.data.data as Profile) || {};
      set({ profile, loaded: true });
      storage.set(STORAGE_KEY.AUTHED, !!profile.user);
    } catch {
      set({ profile: {}, loaded: true });
    }
  },
  clearProfile: () => {
    set({ profile: {}, loaded: true });
    storage.clear();
  },
}));
