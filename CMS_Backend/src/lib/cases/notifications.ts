import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Scale,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export type NotificationCategory =
  | "hearing"
  | "direction"
  | "pending"
  | "restraining"
  | "decided";

export type CaseNotification = {
  id: string;
  title: string;
  message: string;
  channel: string;
  time: string;
  unread: boolean;
  category: NotificationCategory;
};

export const NOTIFICATION_CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon; iconClass: string; wrapClass: string }
> = {
  hearing: {
    label: "Next hearing",
    icon: CalendarClock,
    iconClass: "text-primary-deep",
    wrapClass: "bg-primary-soft/50 border-primary/20",
  },
  direction: {
    label: "Direction compliance",
    icon: ClipboardCheck,
    iconClass: "text-sky-700 dark:text-sky-300",
    wrapClass: "bg-sky-50 border-sky-200/80 dark:bg-sky-950/40 dark:border-sky-800/60",
  },
  pending: {
    label: "Pending cases",
    icon: Clock3,
    iconClass: "text-amber-800 dark:text-amber-300",
    wrapClass: "bg-amber-50 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60",
  },
  restraining: {
    label: "Restraining order",
    icon: ShieldAlert,
    iconClass: "text-rose-800 dark:text-rose-300",
    wrapClass: "bg-rose-50 border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-800/60",
  },
  decided: {
    label: "Decided cases",
    icon: CheckCircle2,
    iconClass: "text-muted-foreground",
    wrapClass: "bg-muted border-border",
  },
};

export function getNotificationMeta(category: NotificationCategory) {
  return (
    NOTIFICATION_CATEGORY_META[category] ?? {
      label: "Alert",
      icon: Scale,
      iconClass: "text-primary-deep",
      wrapClass: "bg-primary-soft/50 border-primary/20",
    }
  );
}

/** Hearing / compliance alerts tied to IPS court registers */
export const caseNotifications: CaseNotification[] = [
  {
    id: "n1",
    title: "Next hearing — Supreme Court",
    message: "Restraining-order matter requires counsel brief before next date.",
    channel: "External Courts",
    time: "2h",
    unread: true,
    category: "hearing",
  },
  {
    id: "n2",
    title: "Direction compliance — Federal Secretary",
    message: "Direction case marked for departmental compliance report.",
    channel: "Internal Courts",
    time: "5h",
    unread: true,
    category: "direction",
  },
  {
    id: "n3",
    title: "Pending cases — Administrator",
    message: "Pending register entries need next-date requirement notes.",
    channel: "Internal Courts",
    time: "1d",
    unread: true,
    category: "pending",
  },
  {
    id: "n4",
    title: "High Court — restraining order",
    message: "Stay order status update due on next hearing date.",
    channel: "External Courts",
    time: "2d",
    unread: false,
    category: "restraining",
  },
  {
    id: "n5",
    title: "Other Courts — decided cases",
    message: "Decided register updated; appeal filing flags to review.",
    channel: "External Courts",
    time: "3d",
    unread: false,
    category: "decided",
  },
  {
    id: "n6",
    title: "Chairman — direction cases",
    message: "Direction compliance checklist pending for two matters.",
    channel: "Internal Courts",
    time: "4d",
    unread: false,
    category: "direction",
  },
];
