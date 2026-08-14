import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/cases/use-notifications";
import type { NotificationItem } from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

function NotificationLink({
  item,
  onClick,
  children,
}: {
  item: NotificationItem;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const meta = item.meta;
  if (meta.layer === "internal" && meta.courtId && meta.caseCategory) {
    return (
      <Link
        to="/internal/$courtId/$category"
        params={{ courtId: meta.courtId, category: meta.caseCategory }}
        className="block px-3.5 py-2.5 transition-colors hover:bg-primary-soft/40"
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  if (meta.layer === "external" && meta.courtId && meta.caseCategory) {
    return (
      <Link
        to="/external/$courtId/$category"
        params={{ courtId: meta.courtId, category: meta.caseCategory }}
        className="block px-3.5 py-2.5 transition-colors hover:bg-primary-soft/40"
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/notifications"
      className="block px-3.5 py-2.5 transition-colors hover:bg-primary-soft/40"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function NotificationDropdown() {
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  async function readAll() {
    try {
      await markAllRead();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not mark notifications read");
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="relative size-9 rounded-full border-border/70 bg-card/90 shadow-soft"
        aria-label="Open notifications"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3.5 py-2.5">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-[11px] text-muted-foreground">{unreadCount} unread</p>
              </div>
              {unreadCount ? (
                <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={() => void readAll()}>
                  <CheckCheck className="size-3.5" />
                  Read all
                </Button>
              ) : null}
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {loading ? (
                <li className="px-3.5 py-4 text-xs text-muted-foreground">Loading notifications…</li>
              ) : items.length === 0 ? (
                <li className="px-3.5 py-4 text-xs text-muted-foreground">No notifications.</li>
              ) : (
                items.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <NotificationLink
                      item={item}
                      onClick={() => {
                        setOpen(false);
                        if (!item.readAt) void markRead(item.id);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            item.readAt ? "bg-muted-foreground/30" : "bg-primary",
                          )}
                        />
                        <div className="min-w-0">
                          <p className={cn("text-xs leading-snug", !item.readAt && "font-semibold")}>
                            {item.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{item.body}</p>
                        </div>
                      </div>
                    </NotificationLink>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-border/50 p-2">
              <Button asChild variant="ghost" className="h-8 w-full rounded-xl text-xs font-semibold">
                <Link to="/notifications" onClick={() => setOpen(false)}>
                  View all notifications
                </Link>
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
