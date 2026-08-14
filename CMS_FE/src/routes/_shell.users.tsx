import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { ReportExportBar } from "@/components/reports/report-export-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api/client";
import {
  createUser,
  fetchUsers,
  updateUser,
  updateUserStatus,
  type ApiUser,
} from "@/lib/api/users";
import { useAuth } from "@/lib/cases/auth-context";
import { canManageRole, ROLE_LABELS } from "@/lib/cases/permissions";
import { readSession } from "@/lib/cases/session";
import { buildUserDirectoryReport } from "@/lib/reports/builders";
import type { UserRole } from "@/lib/cases/types";

export const Route = createFileRoute("/_shell/users")({
  beforeLoad: () => {
    const session = readSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [{ title: "Users & Roles — IPS" }],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { user, can, token } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Staff@123");
  const [role, setRole] = useState<UserRole>("staff");

  const roleOptions = useMemo(() => {
    if (!user) return [] as UserRole[];
    if (user.role === "super-admin" || user.role === "admin") return ["admin", "staff"] as UserRole[];
    return ["staff"] as UserRole[];
  }, [user]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchUsers(token);
      setUsers(data);
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Failed to load users";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("Staff@123");
    setRole(roleOptions[0] ?? "staff");
    setOpen(true);
  }

  function openEdit(row: ApiUser) {
    setEditing(row);
    setName(row.name);
    setEmail(row.email);
    setPassword("");
    setRole(row.role);
    setOpen(true);
  }

  async function handleSave() {
    if (!token) return;
    if (!name.trim() || !email.trim() || (!editing && !password.trim())) {
      toast.error(editing ? "Name and email are required" : "Name, email and password are required");
      return;
    }
    if (role !== "admin" && role !== "staff") {
      toast.error("Invalid role");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const updated = await updateUser(token, editing.id, {
          name: name.trim(),
          email: email.trim(),
          role: role as "admin" | "staff",
          ...(password.trim() ? { password } : {}),
        });
        setUsers((prev) =>
          prev
            .map((row) => (row.id === editing.id ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast.success("User updated in database");
      } else {
        const created = await createUser(token, {
          name: name.trim(),
          email: email.trim(),
          password,
          role: role as "admin" | "staff",
          status: "Active",
        });
        setUsers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("User created in database");
      }
      setName("");
      setEmail("");
      setPassword("Staff@123");
      setEditing(null);
      setOpen(false);
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Could not save user";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(row: ApiUser) {
    if (!token) return;
    const nextStatus = row.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await updateUserStatus(token, row.id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === row.id ? updated : u)));
      toast.success(`User marked ${updated.status}`);
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Could not update status";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Users & Roles"
        description="Directory is loaded from PostgreSQL. Admin and Super Admin can manage staff/admin accounts. Staff cannot access this page."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void loadUsers()}
              disabled={loading}
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {can("users:manage-staff") || can("users:manage-admin") ? (
              <Button
                className="rounded-full bg-brand-gradient font-semibold"
                onClick={openCreate}
              >
                <Plus className="size-4" />
                Add user
              </Button>
            ) : null}
          </div>
        }
      />

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load users ({loadError}). Check the API connection, then refresh.
        </p>
      ) : null}

      {can("users:view") ? (
        <ReportExportBar
          title="User directory export"
          description="Official list of CRM users and assigned roles (from live database)."
          buildPayload={() =>
            buildUserDirectoryReport(
              users.map((u) => ({
                name: u.name,
                email: u.email,
                role: u.roleName || ROLE_LABELS[u.role] || u.role,
                status: u.status,
              })),
              user,
            )
          }
        />
      ) : null}

      <Panel title={`Directory (${users.length})`}>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Loading users from database...
                  </TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                    Failed to load users from the database.
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No users found. Run backend seed (`npm run db:seed`).
                  </TableCell>
                </TableRow>
              ) : (
                users.map((row) => {
                  const manageable =
                    user && row.role
                      ? canManageRole(user.role, row.role) && row.role !== "super-admin"
                      : false;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.roleName || (row.role ? ROLE_LABELS[row.role] : "—")}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="text-right">
                        {manageable ? (
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => openEdit(row)}
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void handleToggleStatus(row)}
                            >
                              Toggle status
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card sm:rounded-xl">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="text-foreground">{editing ? "Edit user" : "Add user"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground/80">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-lg border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
                {editing ? "New password (optional)" : "Temporary password"}
              </Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-semibold text-foreground/80">
                Role
              </Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border bg-card text-foreground"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? "Saving..." : editing ? "Update user" : "Save to database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
