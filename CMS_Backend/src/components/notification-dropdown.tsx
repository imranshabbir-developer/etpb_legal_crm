import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  caseNotifications,
  getNotificationMeta,
} from "@/lib/cases/notifications";
import { NotificationCategoryIcon } from "@/components/notification-category-icon";
import { cn } from "@/lib/utils";

const previewNotifications = caseNotifications.slice(0, 5);
const unreadCount = caseNotifications.filter((n) => n.unread).length;

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-full border border-border/70 bg-card/90 text-muted-foreground shadow-soft transition-all hover:border-primary/30 hover:text-primary data-[state=open]:border-primary/40 data-[state=open]:bg-primary-soft/40"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border/50 bg-card/95 p-0 shadow-soft backdrop-blur-xl data-[side=bottom]:slide-in-from-top-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-3.5 py-2.5">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-deep">
              {unreadCount} new
            </span>
          )}
        </div>

        <ul className="max-h-[17rem] overflow-y-auto">
          {previewNotifications.map((item) => {
            const meta = getNotificationMeta(item.category);
            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "flex gap-2.5 border-b border-border/40 px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-primary-soft/35",
                    item.unread && "bg-primary-soft/20",
                  )}
                >
                  <NotificationCategoryIcon category={item.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground">
                      {item.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-primary-deep">{meta.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.time} ago</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Link
          to="/notifications"
          className="block border-t border-border/50 px-3.5 py-2.5 text-center text-xs font-semibold text-primary-deep transition-colors hover:bg-primary-soft/40"
        >
          Read more
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
