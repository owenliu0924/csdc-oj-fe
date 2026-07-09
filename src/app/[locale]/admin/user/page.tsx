"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Papa from "papaparse";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import adminApi from "@/lib/api/admin";
import { USER_TYPE, PROBLEM_PERMISSION } from "@/lib/constants";
import { Pencil, Trash2, Search } from "lucide-react";

type UserRow = {
  id: number;
  username: string;
  real_name?: string;
  email: string;
  admin_type: string;
  problem_permission: string;
  is_disabled: boolean;
  two_factor_auth?: boolean;
};

export default function AdminUserPage() {
  const t = useTranslations("admin");
  const tm = useTranslations("m");
  const [list, setList] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<UserRow> & { password?: string } | null>(null);
  const [gen, setGen] = useState({
    prefix: "",
    suffix: "",
    number_from: 1,
    number_to: 10,
    password_length: 8,
  });
  const [tab, setTab] = useState<"list" | "import" | "generate">("list");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUserList((page - 1) * limit, limit, keyword);
      const data = res.data.data as { results: UserRow[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const saveUser = async () => {
    if (!edit) return;
    await adminApi.editUser(edit);
    toast.success(tm("Success"));
    setEdit(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete user?")) return;
    await adminApi.deleteUsers(String(id));
    toast.success(tm("Success"));
    load();
  };

  const importCsv = (file: File) => {
    Papa.parse(file, {
      complete: async (results) => {
        await adminApi.importUsers(results.data);
        toast.success(tm("Success"));
        load();
      },
    });
  };

  const generate = async () => {
    await adminApi.generateUser(gen);
    toast.success(tm("Success"));
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["list", "import", "generate"] as const).map((k) => (
          <Button
            key={k}
            size="sm"
            variant={tab === k ? "default" : "secondary"}
            onClick={() => setTab(k)}
          >
            {k === "list"
              ? t("User_User")
              : k === "import"
                ? t("Import_User")
                : t("Generate_User")}
          </Button>

        ))}
      </div>

      {tab === "list" && (
        <GlassPanel
          title={t("User_User")}
          extra={
            <div className="flex gap-2">
              <Input
                className="w-40"
                placeholder="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
              />
              <Button size="sm" variant="secondary" onClick={() => { setPage(1); load(); }}>
                <Search className="h-3.5 w-3.5" />
              </Button>

            </div>

          }
        >
          {loading ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="pb-3 pr-2">ID</th>

                    <th className="pb-3 pr-2">{t("User_Username")}</th>

                    <th className="pb-3 pr-2">{t("User_Email")}</th>

                    <th className="pb-3 pr-2">{t("User_Type")}</th>

                    <th className="pb-3 pr-2">{t("Is_Disabled")}</th>

                    <th className="pb-3">Actions</th>

                  </tr>

                </thead>

                <tbody>
                  {list.map((u) => (
                    <tr key={u.id} className="border-b border-white/5">
                      <td className="py-2 pr-2">{u.id}</td>

                      <td className="py-2 pr-2">{u.username}</td>

                      <td className="py-2 pr-2 text-muted">{u.email}</td>

                      <td className="py-2 pr-2">{u.admin_type}</td>

                      <td className="py-2 pr-2">{u.is_disabled ? "Yes" : "No"}</td>

                      <td className="py-2 flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEdit(u)}>
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button size="icon" variant="ghost" onClick={() => remove(u.id)}>
                          <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                        </Button>

                      </td>

                    </tr>

                  ))}
                </tbody>

              </table>

            </div>

          )}
          <Pagination total={total} page={page} pageSize={limit} onPageChange={setPage} showSizer={false} />
        </GlassPanel>

      )}

      {tab === "import" && (
        <GlassPanel title={t("Import_User")}>
          <p className="mb-3 text-sm text-muted">
            CSV format: username, password, email, real_name (optional)
          </p>

          <Input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importCsv(f);
            }}
          />
        </GlassPanel>

      )}

      {tab === "generate" && (
        <GlassPanel title={t("Generate_User")}>
          <div className="grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Prefix</Label>

              <Input value={gen.prefix} onChange={(e) => setGen({ ...gen, prefix: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Suffix</Label>

              <Input value={gen.suffix} onChange={(e) => setGen({ ...gen, suffix: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>From</Label>

              <Input type="number" value={gen.number_from} onChange={(e) => setGen({ ...gen, number_from: Number(e.target.value) })} />
            </div>

            <div className="space-y-1">
              <Label>To</Label>

              <Input type="number" value={gen.number_to} onChange={(e) => setGen({ ...gen, number_to: Number(e.target.value) })} />
            </div>

            <div className="space-y-1">
              <Label>Password length</Label>

              <Input type="number" value={gen.password_length} onChange={(e) => setGen({ ...gen, password_length: Number(e.target.value) })} />
            </div>

          </div>

          <Button className="mt-4" onClick={generate}>{t("Generate_User")}</Button>

        </GlassPanel>

      )}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("User_Info")}</DialogTitle>

          </DialogHeader>

          {edit && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t("User_Username")}</Label>

                <Input value={edit.username || ""} onChange={(e) => setEdit({ ...edit, username: e.target.value })} />
              </div>

              <div className="space-y-1">
                <Label>{t("User_Real_Name")}</Label>

                <Input value={edit.real_name || ""} onChange={(e) => setEdit({ ...edit, real_name: e.target.value })} />
              </div>

              <div className="space-y-1">
                <Label>{t("User_Email")}</Label>

                <Input value={edit.email || ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
              </div>

              <div className="space-y-1">
                <Label>{t("User_New_Password")}</Label>

                <Input type="password" value={edit.password || ""} onChange={(e) => setEdit({ ...edit, password: e.target.value })} />
              </div>

              <div className="space-y-1">
                <Label>{t("User_Type")}</Label>

                <Select value={edit.admin_type} onValueChange={(v) => setEdit({ ...edit, admin_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>

                  <SelectContent>
                    {Object.values(USER_TYPE).map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>

                    ))}
                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-1">
                <Label>{t("Problem_Permission")}</Label>

                <Select value={edit.problem_permission} onValueChange={(v) => setEdit({ ...edit, problem_permission: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>

                  <SelectContent>
                    {Object.values(PROBLEM_PERMISSION).map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>

                    ))}
                  </SelectContent>

                </Select>

              </div>

              <label className="flex items-center gap-2 text-sm">
                <Switch checked={!!edit.is_disabled} onCheckedChange={(v) => setEdit({ ...edit, is_disabled: v })} />
                {t("Is_Disabled")}
              </label>

              <Button onClick={saveUser}>{tm("Save")}</Button>

            </div>

          )}
        </DialogContent>

      </Dialog>

    </div>

  );
}
