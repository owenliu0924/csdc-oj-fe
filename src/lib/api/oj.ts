import { ajax } from "./client";

export const ojApi = {
  getWebsiteConf(params?: Record<string, unknown>) {
    return ajax("website", "get", { params });
  },
  getAnnouncementList(offset: number, limit: number) {
    return ajax("announcement", "get", { params: { offset, limit } });
  },
  login(data: Record<string, unknown>) {
    return ajax("login", "post", { data });
  },
  checkUsernameOrEmail(username: string, email: string) {
    return ajax("check_username_or_email", "post", {
      data: { username, email },
    });
  },
  register(data: Record<string, unknown>) {
    return ajax("register", "post", { data });
  },
  logout() {
    return ajax("logout", "get");
  },
  getCaptcha() {
    return ajax<{ captcha_key: string; captcha_image: string }>("captcha", "get");
  },
  getUserInfo(username?: string) {
    return ajax("profile", "get", { params: { username } });
  },
  updateProfile(profile: Record<string, unknown>) {
    return ajax("profile", "put", { data: profile });
  },
  freshDisplayID(userID: number | string) {
    return ajax("profile/fresh_display_id", "get", {
      params: { user_id: userID },
    });
  },
  twoFactorAuth(method: string, data?: Record<string, unknown>) {
    return ajax("two_factor_auth", method, { data });
  },
  tfaRequiredCheck(username: string) {
    return ajax("tfa_required", "post", { data: { username } });
  },
  getSessions() {
    return ajax("sessions", "get");
  },
  deleteSession(sessionKey: string) {
    return ajax("sessions", "delete", { params: { session_key: sessionKey } });
  },
  applyResetPassword(data: Record<string, unknown>) {
    return ajax("apply_reset_password", "post", { data });
  },
  resetPassword(data: Record<string, unknown>) {
    return ajax("reset_password", "post", { data });
  },
  changePassword(data: Record<string, unknown>) {
    return ajax("change_password", "post", { data });
  },
  changeEmail(data: Record<string, unknown>) {
    return ajax("change_email", "post", { data });
  },
  getLanguages() {
    return ajax("languages", "get");
  },
  getProblemTagList() {
    return ajax("problem/tags", "get");
  },
  getProblemList(
    offset: number,
    limit: number,
    searchParams: Record<string, unknown> = {}
  ) {
    const params: Record<string, unknown> = {
      paging: true,
      offset,
      limit,
      ...Object.fromEntries(
        Object.entries(searchParams).filter(([, v]) => v !== "" && v != null)
      ),
    };
    return ajax("problem", "get", { params });
  },
  pickone() {
    return ajax("pickone", "get");
  },
  getProblem(problemID: string | number) {
    return ajax("problem", "get", { params: { problem_id: problemID } });
  },
  getContestList(
    offset: number,
    limit: number,
    searchParams?: Record<string, unknown>
  ) {
    const params: Record<string, unknown> = { offset, limit };
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
    }
    return ajax("contests", "get", { params });
  },
  getContest(id: string | number) {
    return ajax("contest", "get", { params: { id } });
  },
  getContestAccess(contestID: string | number) {
    return ajax("contest/access", "get", {
      params: { contest_id: contestID },
    });
  },
  checkContestPassword(contestID: string | number, password: string) {
    return ajax("contest/password", "post", {
      data: { contest_id: contestID, password },
    });
  },
  getContestAnnouncementList(contestId: string | number) {
    return ajax("contest/announcement", "get", {
      params: { contest_id: contestId },
    });
  },
  getContestProblemList(contestId: string | number) {
    return ajax("contest/problem", "get", {
      params: { contest_id: contestId },
    });
  },
  getContestProblem(problemID: string | number, contestID: string | number) {
    return ajax("contest/problem", "get", {
      params: { contest_id: contestID, problem_id: problemID },
    });
  },
  submitCode(data: Record<string, unknown>) {
    return ajax("submission", "post", { data });
  },
  getSubmissionList(
    offset: number,
    limit: number,
    params: Record<string, unknown>
  ) {
    return ajax("submissions", "get", {
      params: { ...params, limit, offset },
    });
  },
  getContestSubmissionList(
    offset: number,
    limit: number,
    params: Record<string, unknown>
  ) {
    return ajax("contest_submissions", "get", {
      params: { ...params, limit, offset },
    });
  },
  getSubmission(id: string) {
    return ajax("submission", "get", { params: { id } });
  },
  submissionExists(problemID: string | number) {
    return ajax("submission_exists", "get", {
      params: { problem_id: problemID },
    });
  },
  submissionRejudge(id: string) {
    return ajax("admin/submission/rejudge", "get", { params: { id } });
  },
  updateSubmission(data: Record<string, unknown>) {
    return ajax("submission", "put", { data });
  },
  getUserRank(offset: number, limit: number, rule = "acm") {
    return ajax("user_rank", "get", { params: { offset, limit, rule } });
  },
  getContestRank(params: Record<string, unknown>) {
    return ajax("contest_rank", "get", { params });
  },
  getACMACInfo(params: Record<string, unknown>) {
    return ajax("admin/contest/acm_helper", "get", { params });
  },
  updateACInfoCheckedStatus(data: Record<string, unknown>) {
    return ajax("admin/contest/acm_helper", "put", { data });
  },
};

export default ojApi;
