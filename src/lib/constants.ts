export const JUDGE_STATUS: Record<
  string,
  { name: string; short?: string; color: string; type: string }
> = {
  "-2": { name: "Compile Error", short: "CE", color: "yellow", type: "warning" },
  "-1": { name: "Wrong Answer", short: "WA", color: "red", type: "error" },
  "0": { name: "Accepted", short: "AC", color: "green", type: "success" },
  "1": {
    name: "Time Limit Exceeded",
    short: "TLE",
    color: "red",
    type: "error",
  },
  "2": {
    name: "Time Limit Exceeded",
    short: "TLE",
    color: "red",
    type: "error",
  },
  "3": {
    name: "Memory Limit Exceeded",
    short: "MLE",
    color: "red",
    type: "error",
  },
  "4": { name: "Runtime Error", short: "RE", color: "red", type: "error" },
  "5": { name: "System Error", short: "SE", color: "red", type: "error" },
  "6": { name: "Pending", color: "yellow", type: "warning" },
  "7": { name: "Judging", color: "blue", type: "info" },
  "8": {
    name: "Partial Accepted",
    short: "PAC",
    color: "blue",
    type: "info",
  },
  "9": { name: "Submitting", color: "yellow", type: "warning" },
};

export const CONTEST_STATUS = {
  NOT_START: "1",
  UNDERWAY: "0",
  ENDED: "-1",
} as const;

export const CONTEST_STATUS_REVERSE: Record<
  string,
  { name: string; color: string }
> = {
  "1": { name: "Not Started", color: "yellow" },
  "0": { name: "Underway", color: "green" },
  "-1": { name: "Ended", color: "red" },
};

export const RULE_TYPE = {
  ACM: "ACM",
  OI: "OI",
} as const;

export const CONTEST_TYPE = {
  PUBLIC: "Public",
  PRIVATE: "Password Protected",
} as const;

export const USER_TYPE = {
  REGULAR_USER: "Regular User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
} as const;

export const PROBLEM_PERMISSION = {
  NONE: "None",
  OWN: "Own",
  ALL: "All",
} as const;

export const STORAGE_KEY = {
  AUTHED: "authed",
  PROBLEM_CODE: "problemCode",
  languages: "languages",
} as const;

export function buildProblemCodeKey(
  problemID: string | number,
  contestID: string | number | null = null
) {
  if (contestID) {
    return `${STORAGE_KEY.PROBLEM_CODE}_${contestID}_${problemID}`;
  }
  return `${STORAGE_KEY.PROBLEM_CODE}_NaN_${problemID}`;
}

export const JUDGE_STATUS_COLOR: Record<string, string> = {
  green:
    "text-[var(--success)] bg-[rgba(93,206,160,0.12)] border-[rgba(93,206,160,0.28)]",
  red: "text-[var(--danger)] bg-[rgba(240,113,120,0.12)] border-[rgba(240,113,120,0.28)]",
  yellow:
    "text-[var(--warning)] bg-[rgba(232,184,109,0.12)] border-[rgba(232,184,109,0.28)]",
  blue: "text-[var(--info)] bg-[rgba(142,180,255,0.12)] border-[rgba(142,180,255,0.28)]",
};
