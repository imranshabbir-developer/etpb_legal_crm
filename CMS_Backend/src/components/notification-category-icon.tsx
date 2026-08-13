import { getNotificationMeta, type NotificationCategory } from "@/lib/cases/notifications";
import { cn } from "@/lib/utils";

export function NotificationCategoryIcon({
  category,
  size = "md",
}: {
  category: NotificationCategory;
  size?: "sm" | "md";
}) {
  const meta = getNotificationMeta(category);
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl border shadow-sm",
        meta.wrapClass,
        size === "sm" ? "size-8" : "size-10",
      )}
      aria-hidden
    >
      <Icon className={cn(size === "sm" ? "size-3.5" : "size-4", meta.iconClass)} strokeWidth={2.1} />
    </span>
  );
}
