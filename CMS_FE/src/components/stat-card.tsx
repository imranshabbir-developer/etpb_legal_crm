import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  progress,
  caption,
  trend,
  featured = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  progress: number;
  caption: string;
  /** Month-over-month % from live DB aggregates. Omit when unavailable. */
  trend?: number | null;
  featured?: boolean;
}) {
  const showTrend = typeof trend === "number" && Number.isFinite(trend);
  const up = showTrend ? trend >= 0 : true;

  return (
    <div
      className={cn(
        "stat-card animate-rise rounded-2xl p-4 sm:p-5",
        featured && "stat-card-featured",
      )}
    >
      <div className="relative z-[1] flex items-start gap-3">
        <span className="stat-card-icon shrink-0">{icon}</span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="stat-card-label truncate">{label}</p>
            {showTrend ? (
              <span
                className={cn(
                  "stat-card-trend flex shrink-0 items-center gap-0.5",
                  up ? "text-primary-deep" : "text-destructive",
                )}
              >
                {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(trend)}%
              </span>
            ) : null}
          </div>

          <p className="stat-card-value mt-1 truncate">{value}</p>
        </div>
      </div>

      <div className="stat-card-progress relative z-[1] mt-4 w-full">
        <div
          className="stat-card-progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <p className="stat-card-caption relative z-[1] mt-2 truncate">{caption}</p>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card animate-rise rounded-2xl p-4 sm:rounded-3xl sm:p-5", className)}>
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h2 className="shrink-0 text-[15px] font-bold tracking-tight sm:text-base">{title}</h2>
        {action && <div className="w-full min-w-0 sm:w-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}
