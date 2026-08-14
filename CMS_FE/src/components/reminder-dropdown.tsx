import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlarmClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  REMINDER_TIMING_META,
  useReminders,
} from "@/lib/cases/use-reminders";
import type { ReminderItem } from "@/lib/api/reminders";
import { cn } from "@/lib/utils";

function RegisterLink({
  item,
  className,
  children,
  onClick,
}: {
  item: ReminderItem;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (item.layer === "internal") {
    return (
      <Link
        to="/internal/$courtId/$category"
        params={{ courtId: item.courtId, category: item.caseCategory }}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/external/$courtId/$category"
      params={{ courtId: item.courtId, category: item.caseCategory }}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function ReminderDropdown() {
  const { items, counts, loading } = useReminders({ limit: 8 });
  const [open, setOpen] = useState(false);
  const badge = counts.overdue + counts.today + counts.tomorrow + counts.inTwoDays;

  return (
    <div className="relative">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="relative size-9 rounded-full border-border/70 bg-card/90 shadow-soft"
        aria-label="Open reminders"
        onClick={() => setOpen((value) => !value)}
      >
        <AlarmClock className="size-4" />
        {badge > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close reminders"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-soft backdrop-blur-xl">
            <div className="border-b border-border/50 px-3.5 py-2.5">
              <p className="text-sm font-semibold">Reminders</p>
              <p className="text-[11px] text-muted-foreground">
                Live from case next dates · {counts.total} active
              </p>
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {loading ? (
                <li className="px-3.5 py-4 text-xs text-muted-foreground">Loading reminders…</li>
              ) : items.length === 0 ? (
                <li className="px-3.5 py-4 text-xs text-muted-foreground">
                  No upcoming or overdue reminders.
                </li>
              ) : (
                items.map((item) => {
                  const timingMeta = REMINDER_TIMING_META[item.timing];
                  return (
                    <li key={item.id}>
                      <RegisterLink
                        item={item}
                        className="block px-3.5 py-2.5 transition-colors hover:bg-primary-soft/40"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold leading-snug text-foreground">
                            {item.title}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                              timingMeta.className,
                            )}
                          >
                            {item.dueLabel}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {item.body}
                        </p>
                      </RegisterLink>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="border-t border-border/50 p-2">
              <Button asChild variant="ghost" className="h-8 w-full rounded-xl text-xs font-semibold">
                <Link to="/reminders" onClick={() => setOpen(false)}>
                  View all reminders
                </Link>
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
