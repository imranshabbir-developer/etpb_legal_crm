import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Landmark, Scale, Settings, UsersRound, AlarmClock } from "lucide-react";

import { useAuth } from "@/lib/cases/auth-context";
import { useModules } from "@/lib/cases/modules-context";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can } = useAuth();
  const { modules } = useModules();

  const tabs = [
    { label: "Home", to: "/dashboard", icon: LayoutDashboard, match: (path: string) => path === "/dashboard" },
    ...(modules.showInternalModule
      ? [
          {
            label: "Internal",
            to: "/internal",
            icon: Landmark,
            match: (path: string) => path.startsWith("/internal"),
          },
        ]
      : []),
    ...(modules.showExternalModule
      ? [
          {
            label: "External",
            to: "/external",
            icon: Scale,
            match: (path: string) => path.startsWith("/external"),
          },
        ]
      : []),
    ...(can("users:view")
      ? [{ label: "Users", to: "/users", icon: UsersRound, match: (path: string) => path.startsWith("/users") }]
      : []),
    ...(can("cases:view")
      ? [
          {
            label: "Reminders",
            to: "/reminders",
            icon: AlarmClock,
            match: (path: string) => path.startsWith("/reminders"),
          },
        ]
      : []),
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
      match: (path: string) => path.startsWith("/settings"),
    },
  ];

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 md:hidden" aria-label="Main navigation">
      <div className="mobile-bottom-nav-inner mx-auto flex max-w-lg items-stretch justify-around px-1">
        {tabs.map(({ label, to, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "mobile-bottom-nav-item flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 transition-colors",
                active && "mobile-bottom-nav-item-active",
              )}
            >
              <Icon className={cn("size-5 shrink-0", active ? "text-primary-deep" : "text-muted-foreground")} />
              <span
                className={cn(
                  "max-w-full truncate text-[10px] font-semibold leading-none",
                  active ? "text-primary-deep" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
