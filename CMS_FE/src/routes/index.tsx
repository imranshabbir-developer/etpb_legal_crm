import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginAtmosphere } from "@/components/login-atmosphere";
import { LoginHeroIllustration } from "@/components/login-hero-illustration";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchRoles, type ApiRole } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/lib/cases/auth-context";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import { DEMO_PASSWORDS, DEMO_USERS } from "@/lib/cases/session";
import type { UserRole } from "@/lib/cases/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — IPS Legal CRM Management" },
      {
        name: "description",
        content:
          "Sign in to the Evacuee Trust Property Board Legal CRM Management System for internal and external court cases.",
      },
      { property: "og:title", content: "Sign in — IPS Legal CRM Management" },
    ],
  }),
  component: LoginPage,
});

const FALLBACK_ROLES: ApiRole[] = [
  {
    id: "super-admin",
    name: ROLE_LABELS["super-admin"],
    slug: "super-admin",
    description: "Full system access",
    permissions: [],
  },
  {
    id: "admin",
    name: ROLE_LABELS.admin,
    slug: "admin",
    description: "Manage cases and users",
    permissions: [],
  },
  {
    id: "staff",
    name: ROLE_LABELS.staff,
    slug: "staff",
    description: "View and edit cases",
    permissions: [],
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      void navigate({ to: "/dashboard" });
    }
  }, [ready, user, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      setRolesLoading(true);
      try {
        const data = await fetchRoles();
        if (!cancelled) {
          setRoles(data);
        }
      } catch {
        if (!cancelled) {
          setRoles(FALLBACK_ROLES);
          setError("Could not load roles from server. Showing defaults — ensure backend is running.");
        }
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    }

    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, []);

  function prefillRole(nextRole: UserRole) {
    const demo = DEMO_USERS.find((u) => u.role === nextRole);
    setRole(nextRole);
    setEmail(demo?.email || "");
    setPassword(DEMO_PASSWORDS[nextRole] || "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password, role });
      await navigate({ to: "/dashboard" });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to sign in. Check your credentials and API connection.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <LoginAtmosphere />
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
        <ThemeToggle />
      </div>

      <div className="login-shell login-shell--branding-hidden">
        <div className="login-form">
          <div className="login-form-header login-branding-temp-hidden">
            <h1 className="login-form-title">
              <span className="login-form-title-line">IPS</span>
              <span className="login-form-title-line">Legal CRM Management System</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form-fields">
            <div className="space-y-2">
              <Label htmlFor="email" className="login-form-label">
                Email address
              </Label>
              <div className="relative">
                <Mail className="login-form-field-icon" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@ips.gov.pk"
                  className="login-crystal-input ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="login-form-label">
                Password
              </Label>
              <div className="relative">
                <Lock className="login-form-field-icon" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="login-crystal-input ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="login-form-label">
                Role
              </Label>
              <div className="relative">
                <Shield className="login-form-field-icon" />
                <select
                  id="role"
                  required
                  value={role}
                  disabled={rolesLoading || submitting}
                  onChange={(e) => {
                    const next = e.target.value as UserRole;
                    if (!next) return;
                    prefillRole(next);
                  }}
                  className="login-crystal-input flex h-9 w-full appearance-none rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm outline-none"
                >
                  <option value="" disabled>
                    {rolesLoading ? "Loading roles..." : "Select role (Admin / Super Admin / Staff)"}
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Roles are loaded from the database. Selecting a role prefills the seeded demo account for that role;
                login is validated by the backend with JWT.
              </p>
            </div>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}

            <div className="login-form-meta">
              <label className="flex items-center gap-2">
                <Checkbox className="login-crystal-checkbox" />
                Remember me
              </label>
              <button type="button" className="login-form-link">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="login-crystal-button" disabled={!role || submitting}>
              {submitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>

        <div className="login-visual login-branding-temp-hidden">
          <LoginHeroIllustration />
        </div>
      </div>
    </div>
  );
}
