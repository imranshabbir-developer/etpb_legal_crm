import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginAtmosphere } from "@/components/login-atmosphere";
import { LoginHeroIllustration } from "@/components/login-hero-illustration";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/cases/auth-context";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import { DEMO_PASSWORDS, roleDemoUser } from "@/lib/cases/session";
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

const ROLES: UserRole[] = ["admin", "super-admin", "staff"];

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");

  function signInAs(nextRole: UserRole) {
    const user = roleDemoUser(nextRole);
    setRole(nextRole);
    setEmail(user.email);
    setPassword(DEMO_PASSWORDS[nextRole]);
    login(user);
    void navigate({ to: "/dashboard" });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    signInAs(role);
  };

  return (
    <div className="login-page">
      <LoginAtmosphere />
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
        <ThemeToggle />
      </div>

      <div className="login-shell login-shell--branding-hidden">
        <div className="login-form">
          {/* Temporarily hidden — restore by removing login-branding-temp-hidden */}
          <div className="login-form-header login-branding-temp-hidden">
            <h1 className="login-form-title">
              <span className="login-form-title-line">IPS</span>
              <span className="login-form-title-line">Legal CRM Management System</span>
            </h1>
          </div>

          <form onSubmit={submit} className="login-form-fields">
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
                  placeholder="Select a role to auto-fill"
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
                  placeholder="Select a role to auto-fill"
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
                  onChange={(e) => {
                    const next = e.target.value as UserRole;
                    if (!next) return;
                    // Auto-fill credentials and enter that role’s dashboard
                    signInAs(next);
                  }}
                  className="login-crystal-input flex h-9 w-full appearance-none rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm outline-none"
                >
                  <option value="" disabled>
                    Select role (Admin / Super Admin / Staff)
                  </option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Choose <strong>Admin</strong> to auto-fill email/password and open the dashboard with full case add /
                edit / delete access. Super Admin includes module controls; Staff can view and edit cases only.
              </p>
            </div>

            <div className="login-form-meta">
              <label className="flex items-center gap-2">
                <Checkbox className="login-crystal-checkbox" />
                Remember me
              </label>
              <button type="button" className="login-form-link">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="login-crystal-button" disabled={!role}>
              Login
            </Button>
          </form>
        </div>

        {/* Temporarily hidden — restore by removing login-branding-temp-hidden */}
        <div className="login-visual login-branding-temp-hidden">
          <LoginHeroIllustration />
        </div>
      </div>
    </div>
  );
}
