import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
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
import { useAuth } from "@/lib/cases/auth-context";
import { canManageRole, ROLE_LABELS } from "@/lib/cases/permissions";
import { DEMO_USERS, readSession } from "@/lib/cases/session";
import type { AppUser, UserRole } from "@/lib/cases/types";

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
  const { user, can } = useAuth();
  const [users, setUsers] = useState<AppUser[]>(DEMO_USERS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("staff");

  const roleOptions = useMemo(() => {
    if (!user) return [] as UserRole[];
    if (user.role === "super-admin" || user.role === "admin") return ["admin", "staff"] as UserRole[];
    return ["staff"] as UserRole[];
  }, [user]);

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Users & Roles"
        description="Admin and Super Admin have full access to manage users and case registers. Staff cannot access this page."
        actions={
          can("users:manage-staff") || can("users:manage-admin") ? (
            <Button
              className="rounded-full bg-brand-gradient font-semibold"
              onClick={() => {
                setRole(roleOptions[0] ?? "staff");
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add user
            </Button>
          ) : null
        }
      />

      <Panel title="Directory">
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
              {users.map((row) => {
                const manageable = user ? canManageRole(user.role, row.role) && row.role !== "super-admin" : false;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{ROLE_LABELS[row.role]}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell className="text-right">
                      {manageable ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setUsers((prev) =>
                              prev.map((u) =>
                                u.id === row.id
                                  ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
                                  : u,
                              ),
                            );
                            toast.success("User status updated");
                          }}
                        >
                          Toggle status
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>

      {can("modules:configure") ? (
        <Panel title="Super Admin — module controls">
          <p className="text-sm text-muted-foreground">
            Ultimate access: configure future dashboard views/modules for the CRM Management System without
            changing the existing theme.
          </p>
          <Button
            className="mt-3 rounded-full"
            variant="outline"
            onClick={() =>
              toast.message("Module configuration", {
                description: "Placeholder for adding new dashboard functions/views.",
              })
            }
          >
            Configure modules
          </Button>
        </Panel>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card sm:rounded-xl">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="text-foreground">Add user</DialogTitle>
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
            <Button variant="outline" className="border-border bg-card text-foreground" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (!name.trim() || !email.trim()) {
                  toast.error("Name and email are required");
                  return;
                }
                setUsers((prev) => [
                  ...prev,
                  {
                    id: `u-${Date.now()}`,
                    name: name.trim(),
                    email: email.trim(),
                    role,
                    status: "Active",
                  },
                ]);
                setName("");
                setEmail("");
                setOpen(false);
                toast.success("User added");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
