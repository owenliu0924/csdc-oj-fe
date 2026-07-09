"use client";

import { create } from "zustand";
import dayjs from "dayjs";
import ojApi from "@/lib/api/oj";
import {
  CONTEST_STATUS,
  CONTEST_TYPE,
  USER_TYPE,
} from "@/lib/constants";
import { useUserStore } from "./user";

export type Contest = {
  id?: number;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  now?: string;
  rule_type?: string;
  contest_type?: string;
  real_time_rank?: boolean;
  created_by?: { id?: number; username?: string };
  status?: string;
  [key: string]: unknown;
};

type ContestState = {
  now: dayjs.Dayjs;
  access: boolean;
  rankLimit: number;
  forceUpdate: boolean;
  contest: Contest;
  contestProblems: unknown[];
  itemVisible: { menu: boolean; chart: boolean; realName: boolean };
  setContest: (contest: Contest) => void;
  setAccess: (access: boolean) => void;
  setProblems: (problems: unknown[]) => void;
  setItemVisible: (v: Partial<ContestState["itemVisible"]>) => void;
  setRankLimit: (n: number) => void;
  setForceUpdate: (v: boolean) => void;
  clear: () => void;
  tick: () => void;
  setNow: (now: dayjs.Dayjs) => void;
  loadContest: (contestID: string | number) => Promise<Contest>;
  loadProblems: (contestID: string | number) => Promise<void>;
  loadAccess: (contestID: string | number) => Promise<void>;
  contestStatus: () => string | null;
  isContestAdmin: () => boolean;
  contestMenuDisabled: () => boolean;
  oiRealtimePermission: () => boolean;
  problemSubmitDisabled: () => boolean;
  passwordFormVisible: () => boolean;
  countdown: () => string;
};

export const useContestStore = create<ContestState>((set, get) => ({
  now: dayjs(),
  access: false,
  rankLimit: 30,
  forceUpdate: false,
  contest: { created_by: {} },
  contestProblems: [],
  itemVisible: { menu: true, chart: true, realName: false },
  setContest: (contest) => set({ contest }),
  setAccess: (access) => set({ access }),
  setProblems: (contestProblems) => set({ contestProblems }),
  setItemVisible: (v) =>
    set((s) => ({ itemVisible: { ...s.itemVisible, ...v } })),
  setRankLimit: (rankLimit) => set({ rankLimit }),
  setForceUpdate: (forceUpdate) => set({ forceUpdate }),
  clear: () =>
    set({
      contest: { created_by: {} },
      contestProblems: [],
      access: false,
      itemVisible: { menu: true, chart: true, realName: false },
      forceUpdate: false,
    }),
  tick: () => set((s) => ({ now: s.now.add(1, "second") })),
  setNow: (now) => set({ now }),
  loadContest: async (contestID) => {
    const res = await ojApi.getContest(contestID);
    const contest = res.data.data as Contest;
    set({ contest, now: dayjs(contest.now) });
    if (contest.contest_type === CONTEST_TYPE.PRIVATE) {
      await get().loadAccess(contestID);
    }
    return contest;
  },
  loadProblems: async (contestID) => {
    try {
      const res = await ojApi.getContestProblemList(contestID);
      const list = (res.data.data as { _id: string }[]).slice().sort((a, b) => {
        if (a._id === b._id) return 0;
        return a._id > b._id ? 1 : -1;
      });
      set({ contestProblems: list });
    } catch {
      set({ contestProblems: [] });
    }
  },
  loadAccess: async (contestID) => {
    try {
      const res = await ojApi.getContestAccess(contestID);
      set({ access: !!(res.data.data as { access: boolean }).access });
    } catch {

    }
  },
  contestStatus: () => {
    const { contest, now } = get();
    if (!contest.start_time || !contest.end_time) return null;
    const start = dayjs(contest.start_time);
    const end = dayjs(contest.end_time);
    if (start.isAfter(now)) return CONTEST_STATUS.NOT_START;
    if (end.isBefore(now)) return CONTEST_STATUS.ENDED;
    return CONTEST_STATUS.UNDERWAY;
  },
  isContestAdmin: () => {
    const user = useUserStore.getState();
    const c = get().contest;
    if (!user.isAuthenticated()) return false;
    return (
      c.created_by?.id === user.user().id ||
      user.user().admin_type === USER_TYPE.SUPER_ADMIN
    );
  },
  contestMenuDisabled: () => {
    if (get().isContestAdmin()) return false;
    const c = get().contest;
    if (c.contest_type === CONTEST_TYPE.PUBLIC) {
      return get().contestStatus() === CONTEST_STATUS.NOT_START;
    }
    return !get().access;
  },
  oiRealtimePermission: () => {
    if (get().contest.rule_type === "ACM") return true;
    if (get().contestStatus() === CONTEST_STATUS.ENDED) return true;
    return get().contest.real_time_rank === true || get().isContestAdmin();
  },
  problemSubmitDisabled: () => {
    const status = get().contestStatus();
    if (status === CONTEST_STATUS.ENDED) return true;
    if (status === CONTEST_STATUS.NOT_START) return !get().isContestAdmin();
    return !useUserStore.getState().isAuthenticated();
  },
  passwordFormVisible: () => {
    const c = get().contest;
    return (
      c.contest_type !== CONTEST_TYPE.PUBLIC &&
      !get().access &&
      !get().isContestAdmin()
    );
  },
  countdown: () => {
    const status = get().contestStatus();
    const { contest, now } = get();
    if (status === CONTEST_STATUS.NOT_START) {
      const start = dayjs(contest.start_time);
      const secs = start.diff(now, "second");
      const hours = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `-${hours}:${mins}:${s}`;
    }
    if (status === CONTEST_STATUS.UNDERWAY) {
      const end = dayjs(contest.end_time);
      const secs = end.diff(now, "second");
      const hours = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `-${hours}:${mins}:${s}`;
    }
    return "Ended";
  },
}));
