import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, User } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { ReminderDropdown } from "@/components/reminder-dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/cases/auth-context";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import { cn } from "@/lib/utils";
import ffLogo from "@/assets/ff_logo.png";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Topbar() {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? "IPS User";
  const displayEmail = user?.email ?? "cases@ips.gov.pk";
  const roleLabel = user ? ROLE_LABELS[user.role] : null;

  return (
    <header className="app-topbar mobile-app-topbar sticky top-0 z-20">
      <div className="flex h-14 w-full items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 md:justify-between md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-initial">
          <Link to="/dashboard" className="flex min-w-0 flex-1 items-center justify-center md:hidden">
            <img src={ffLogo} alt="IPS" className="h-9 max-w-[9rem] object-contain" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <ReminderDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full border border-border/70 bg-card/90 p-0.5 pr-2.5 shadow-soft transition-all hover:border-primary/30 hover:bg-card data-[state=open]:border-primary/40 data-[state=open]:bg-primary-soft/40 sm:py-1 sm:pl-1"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-brand-gradient text-xs font-bold text-primary-foreground">
                    {initials(displayName) || "ET"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:inline">
                  {displayName}
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 sm:inline" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="min-w-[12.5rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border/50 bg-card/95 p-1.5 shadow-soft backdrop-blur-xl data-[side=bottom]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              <DropdownMenuLabel className="px-2.5 py-2">
                <p className="text-sm font-semibold text-foreground">{displayName}</p>
                <p className="text-xs font-medium text-muted-foreground">{displayEmail}</p>
                {roleLabel ? (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-primary-deep">
                    {roleLabel}
                  </p>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/70" />
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-2.5 py-2 focus:bg-primary-soft focus:text-primary-deep">
                <Link to="/settings" className="flex w-full items-center gap-2">
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-2.5 py-2 focus:bg-destructive/10 focus:text-destructive">
                <Link
                  to="/"
                  className="flex w-full items-center gap-2"
                  onClick={() => {
                    logout();
                  }}
                >
                  <LogOut className="size-4" />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg font-extrabold tracking-tight sm:text-2xl md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground sm:mt-1 sm:text-sm">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">{actions}</div>
      )}
    </div>
  );
}
