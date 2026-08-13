import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, LayoutDashboard, Moon, Palette, ShieldCheck, SlidersHorizontal, Sun } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [{ title: "Settings — IPS CRM Management" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, can } = useAuth();
  const { theme, setTheme } = useTheme();
  const { resetToSeed } = useCaseStore();
  const [showInternalModule, setShowInternalModule] = useState(true);
  const [showExternalModule, setShowExternalModule] = useState(true);
  const [showChartsModule, setShowChartsModule] = useState(true);

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Settings"
        description="Workspace preferences for the IPS Legal CRM Management System."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Profile">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" defaultValue={user?.name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user?.email ?? ""} />
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm">
              Role: <strong>{user ? ROLE_LABELS[user.role] : "—"}</strong>
            </div>
            {can("settings:manage") ? (
              <Button
                className="rounded-full bg-brand-gradient font-semibold"
                onClick={() => toast.success("Profile saved (demo)")}
              >
                Save profile
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Staff can view settings; admins can save changes.</p>
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

        <Panel title="Case workspace">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <LayoutDashboard className="mt-0.5 size-4 text-primary" />
              <p>Default landing: Dashboard with Internal / External court summaries.</p>
            </div>
            <div className="flex items-start gap-2">
              <Bell className="mt-0.5 size-4 text-primary" />
              <p>Hearing reminders and restraining-order follow-ups appear under Notifications.</p>
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
              onClick={() =>
                toast.success("Modules updated (demo)", {
                  description: `Internal ${showInternalModule ? "on" : "off"} · External ${showExternalModule ? "on" : "off"} · Charts ${showChartsModule ? "on" : "off"}`,
                })
              }
            >
              <SlidersHorizontal className="size-4" />
              Save module configuration
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                resetToSeed();
                toast.success("Case register restored to seed data");
              }}
            >
              Reset case data to seed
            </Button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
