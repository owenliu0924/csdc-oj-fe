import { ajax } from "./client";
import { filterEmptyValue } from "@/lib/utils";
import apiClient from "./client";
import { getCookie } from "@/lib/utils";

export const adminApi = {
  login(username: string, password: string) {
    return ajax("login", "post", { data: { username, password } });
  },
  logout() {
    return ajax("logout", "get");
  },
  getProfile() {
    return ajax("profile", "get");
  },
  getAnnouncementList(offset: number, limit: number) {
    return ajax("admin/announcement", "get", {
      params: { paging: true, offset, limit },
    });
  },
  deleteAnnouncement(id: number | string) {
    return ajax("admin/announcement", "delete", { params: { id } });
  },
  updateAnnouncement(data: Record<string, unknown>) {
    return ajax("admin/announcement", "put", { data });
  },
  createAnnouncement(data: Record<string, unknown>) {
    return ajax("admin/announcement", "post", { data });
  },
  getUserList(offset: number, limit: number, keyword?: string) {
    const params: Record<string, unknown> = { paging: true, offset, limit };
    if (keyword) params.keyword = keyword;
    return ajax("admin/user", "get", { params });
  },
  getUser(id: number | string) {
    return ajax("admin/user", "get", { params: { id } });
  },
  editUser(data: Record<string, unknown>) {
    return ajax("admin/user", "put", { data });
  },
  deleteUsers(id: string) {
    return ajax("admin/user", "delete", { params: { id } });
  },
  importUsers(users: unknown) {
    return ajax("admin/user", "post", { data: { users } });
  },
  generateUser(data: Record<string, unknown>) {
    return ajax("admin/generate_user", "post", { data });
  },
  getLanguages() {
    return ajax("languages", "get");
  },
  getSMTPConfig() {
    return ajax("admin/smtp", "get");
  },
  createSMTPConfig(data: Record<string, unknown>) {
    return ajax("admin/smtp", "post", { data });
  },
  editSMTPConfig(data: Record<string, unknown>) {
    return ajax("admin/smtp", "put", { data });
  },
  testSMTPConfig(email: string) {
    return ajax("admin/smtp_test", "post", { data: { email } });
  },
  getWebsiteConfig() {
    return ajax("admin/website", "get");
  },
  editWebsiteConfig(data: Record<string, unknown>) {
    return ajax("admin/website", "post", { data });
  },
  getJudgeServer() {
    return ajax("admin/judge_server", "get");
  },
  deleteJudgeServer(hostname: string) {
    return ajax("admin/judge_server", "delete", { params: { hostname } });
  },
  updateJudgeServer(data: Record<string, unknown>) {
    return ajax("admin/judge_server", "put", { data });
  },
  getInvalidTestCaseList() {
    return ajax("admin/prune_test_case", "get");
  },

  pruneTestCase(id?: string) {
    return ajax("admin/prune_test_case", "delete", {
      params: id ? { id } : {},
    });
  },
  createContest(data: Record<string, unknown>) {
    return ajax("admin/contest", "post", { data });
  },
  getContest(id: string | number) {
    return ajax("admin/contest", "get", { params: { id } });
  },
  editContest(data: Record<string, unknown>) {
    return ajax("admin/contest", "put", { data });
  },
  getContestList(offset: number, limit: number, keyword?: string) {
    const params: Record<string, unknown> = { paging: true, offset, limit };
    if (keyword) params.keyword = keyword;
    return ajax("admin/contest", "get", { params });
  },
  getContestAnnouncementList(contestID: string | number) {
    return ajax("admin/contest/announcement", "get", {
      params: { contest_id: contestID },
    });
  },
  createContestAnnouncement(data: Record<string, unknown>) {
    return ajax("admin/contest/announcement", "post", { data });
  },
  deleteContestAnnouncement(id: number | string) {
    return ajax("admin/contest/announcement", "delete", { params: { id } });
  },
  updateContestAnnouncement(data: Record<string, unknown>) {
    return ajax("admin/contest/announcement", "put", { data });
  },
  getProblemTagList(params?: Record<string, unknown>) {
    return ajax("problem/tags", "get", { params });
  },
  compileSPJ(data: Record<string, unknown>) {
    return ajax("admin/compile_spj", "post", { data });
  },
  createProblem(data: Record<string, unknown>) {
    return ajax("admin/problem", "post", { data });
  },
  editProblem(data: Record<string, unknown>) {
    return ajax("admin/problem", "put", { data });
  },
  deleteProblem(id: number | string) {
    return ajax("admin/problem", "delete", { params: { id } });
  },
  getProblem(id: number | string) {
    return ajax("admin/problem", "get", { params: { id } });
  },
  getProblemList(params: Record<string, unknown>) {
    return ajax("admin/problem", "get", {
      params: filterEmptyValue(params),
    });
  },
  getContestProblemList(params: Record<string, unknown>) {
    return ajax("admin/contest/problem", "get", {
      params: filterEmptyValue(params),
    });
  },
  getContestProblem(id: number | string) {
    return ajax("admin/contest/problem", "get", { params: { id } });
  },
  createContestProblem(data: Record<string, unknown>) {
    return ajax("admin/contest/problem", "post", { data });
  },
  editContestProblem(data: Record<string, unknown>) {
    return ajax("admin/contest/problem", "put", { data });
  },
  deleteContestProblem(id: number | string) {
    return ajax("admin/contest/problem", "delete", { params: { id } });
  },
  makeContestProblemPublic(data: Record<string, unknown>) {
    return ajax("admin/contest_problem/make_public", "post", { data });
  },
  addProblemFromPublic(data: Record<string, unknown>) {
    return ajax("admin/contest/add_problem_from_public", "post", { data });
  },
  getReleaseNotes() {
    return ajax("admin/versions", "get");
  },
  getDashboardInfo() {
    return ajax("admin/dashboard_info", "get");
  },
  getSessions() {
    return ajax("sessions", "get");
  },
  exportProblems(data: Record<string, unknown>) {
    return ajax("export_problem", "post", { data, responseType: "blob" });
  },

  async uploadTestCase(file: File) {
    const form = new FormData();
    form.append("file", file);
    const csrf = getCookie("csrftoken");
    const res = await apiClient.post("admin/test_case", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
    });
    return res.data;
  },
  async uploadImage(file: File) {
    const form = new FormData();
    form.append("image", file);
    const csrf = getCookie("csrftoken");
    const res = await apiClient.post("admin/upload_image", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
    });
    return res.data;
  },
};

export default adminApi;
