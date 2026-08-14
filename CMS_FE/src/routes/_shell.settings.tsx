import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Moon, Palette, ShieldCheck, SlidersHorizontal, Sun } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateSettingsPassword,
  updateSettingsProfile,
} from "@/lib/api/settings";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { useModules } from "@/lib/cases/modules-context";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import { saveSession, toSessionUser } from "@/lib/cases/session";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [{ title: "Settings — IPS CRM Management" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, can, token } = useAuth();
  const { theme, setTheme } = useTheme();
  const { reload } = useCaseStore();
  const { modules, saveModules, loading: modulesLoading, error: modulesError } = useModules();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showInternalModule, setShowInternalModule] = useState(modules.showInternalModule);
  const [showExternalModule, setShowExternalModule] = useState(modules.showExternalModule);
  const [showChartsModule, setShowChartsModule] = useState(modules.showChartsModule);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  useEffect(() => {
    setShowInternalModule(modules.showInternalModule);
    setShowExternalModule(modules.showExternalModule);
    setShowChartsModule(modules.showChartsModule);
  }, [modules]);

  async function saveProfile() {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await updateSettingsProfile(token, { name, email });
      saveSession(
        toSessionUser({
          ...updated,
          roleName: updated.roleName || updated.role,
        }),
        token,
      );
      toast.success("Profile saved");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (!token) return;
    setSaving(true);
    try {
      await updateSettingsPassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  async function saveModuleFlags() {
    setSaving(true);
    try {
      await saveModules({
        showInternalModule,
        showExternalModule,
        showChartsModule,
      });
      toast.success("Module configuration saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save modules");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Settings"
        description="Workspace preferences for the IPS Legal CRM Management System."
      />

      {modulesError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load module settings ({modulesError}). Defaults are shown until the API is reachable.
        </p>
      ) : null}
      {modulesLoading ? (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Loading settings from the database…
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Profile">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm">
              Role: <strong>{user ? ROLE_LABELS[user.role] : "—"}</strong>
            </div>
            {can("settings:manage") ? (
              <Button
                className="rounded-full bg-brand-gradient font-semibold"
                disabled={saving}
                onClick={() => void saveProfile()}
              >
                Save profile
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Staff can view settings; admins can save profile changes.</p>
            )}
          </div>
        </Panel>

        <Panel title="Appearance">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Switch the whole workspace — login, pages, dialogs, and charts — between light and dark mode.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                  theme === "light"
                    ? "border-primary/40 bg-primary-soft text-primary-deep"
                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground",
                )}
              >
                <Sun className="size-4" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                  theme === "dark"
                    ? "border-primary/40 bg-primary-soft text-primary-deep"
                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground",
                )}
              >
                <Moon className="size-4" />
                Dark
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Change password">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button
              className="rounded-full bg-brand-gradient font-semibold"
              disabled={saving || !currentPassword || newPassword.length < 6}
              onClick={() => void savePassword()}
            >
              Update password
            </Button>
          </div>
        </Panel>

        <Panel title="Case workspace">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <LayoutDashboard className="mt-0.5 size-4 text-primary" />
              <p>Default landing: Dashboard with Internal / External court summaries and live hearing reminders.</p>
            </div>
            <div className="flex items-start gap-2">
              <Palette className="mt-0.5 size-4 text-primary" />
              <p>Use the top-bar sun/moon control or Appearance settings for light and dark themes.</p>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 text-primary" />
              <p>
                Permissions: Staff (view/edit cases), Admin (CRUD + staff users), Super Admin (ultimate including
                module configuration).
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {can("modules:configure") ? (
        <Panel title="Super Admin — module configuration">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ultimate control to enable or hide dashboard modules. Only Super Admin can change these toggles.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInternalModule}
                  onChange={(e) => setShowInternalModule(e.target.checked)}
                />
                Internal Courts module
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={showExternalModule}
                  onChange={(e) => setShowExternalModule(e.target.checked)}
                />
                External Courts module
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={showChartsModule}
                  onChange={(e) => setShowChartsModule(e.target.checked)}
                />
                Dashboard charts
              </label>
            </div>
            <Button
              className="rounded-full bg-brand-gradient font-semibold"
              disabled={saving}
              onClick={() => void saveModuleFlags()}
            >
              <SlidersHorizontal className="size-4" />
              Save module configuration
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                void reload().then(() => {
                  toast.success("Case register reloaded from database");
                });
              }}
            >
              Reload cases from database
            </Button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
