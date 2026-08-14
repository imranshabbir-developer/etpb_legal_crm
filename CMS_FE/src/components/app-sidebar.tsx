import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Landmark,
  Scale,
  Settings,
  UsersRound,
  LogOut,
  AlarmClock,
  Bell,
} from "lucide-react";

import ffLogo from "@/assets/ff_logo.png";
import { useAuth } from "@/lib/cases/auth-context";
import { useModules } from "@/lib/cases/modules-context";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import { clearSession } from "@/lib/cases/session";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const activeItemClass = "sidebar-active-item";

/**
 * Flat operational nav: courts live on overview pages (cards + categories),
 * not as cramped nested sidebar links.
 */
export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, can, logout } = useAuth();
  const { modules } = useModules();

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon" className="app-sidebar sidebar-gradient relative z-10 overflow-x-hidden">
      <SidebarHeader className={cn("relative !gap-0 !p-0 px-3 py-2", collapsed && "px-2 py-1.5")}>
        <SidebarTrigger className={cn("z-10 size-6 shrink-0", collapsed ? "mx-auto" : "absolute right-2 top-2")} />
        {/* Temporarily hidden — restore by removing sidebar-logo-temp-hidden */}
        <div className="sidebar-logo-temp-hidden flex w-full justify-center">
          <Link
            to="/dashboard"
            className="flex w-full justify-center"
            onClick={
              collapsed
                ? (event) => {
                    event.preventDefault();
                    toggleSidebar();
                  }
                : undefined
            }
          >
            <img
              src={ffLogo}
              alt="IPS"
              className={cn(
                "mx-auto my-2 object-contain object-center",
                collapsed ? "h-9 w-full max-w-[2.75rem] object-left" : "h-12 w-full max-w-full px-1",
              )}
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 overflow-x-hidden">
        <SidebarGroup className="!p-0 px-2 pb-2">
          {!collapsed && (
            <SidebarGroupLabel className="h-6 px-2 text-[11px] uppercase tracking-wide">
              CRM Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn(collapsed && "items-center")}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Dashboard" className={activeItemClass}>
                  <Link to="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {modules.showInternalModule ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/internal")}
                    tooltip="Internal Courts"
                    className={activeItemClass}
                  >
                    <Link to="/internal">
                      <Landmark />
                      <span>Internal Courts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}

              {modules.showExternalModule ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/external")}
                    tooltip="External Courts"
                    className={activeItemClass}
                  >
                    <Link to="/external">
                      <Scale />
                      <span>External Courts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}

              {can("users:view") ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/users")} tooltip="Users" className={activeItemClass}>
                    <Link to="/users">
                      <UsersRound />
                      <span>Users & Roles</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}

              {can("cases:view") ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/reminders")}
                      tooltip="Reminders"
                      className={activeItemClass}
                    >
                      <Link to="/reminders">
                        <AlarmClock />
                        <span>Reminders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/notifications")}
                      tooltip="Notifications"
                      className={activeItemClass}
                    >
                      <Link to="/notifications">
                        <Bell />
                        <span>Notifications</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : null}

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings" className={activeItemClass}>
                  <Link to="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        {!collapsed && user ? (
          <div className="mb-2 rounded-xl border border-border/50 bg-card/70 px-3 py-2">
            <p className="truncate text-xs font-semibold">{user.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>
        ) : null}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout" className={activeItemClass}>
              <Link
                to="/"
                onClick={() => {
                  logout();
                  clearSession();
                }}
              >
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
