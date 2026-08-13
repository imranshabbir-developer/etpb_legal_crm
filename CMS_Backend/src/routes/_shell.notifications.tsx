import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import {
  caseNotifications,
  getNotificationMeta,
} from "@/lib/cases/notifications";
import { NotificationCategoryIcon } from "@/components/notification-category-icon";

const pageItems = [
  {
    id: "n1",
    title: "Next hearing — Supreme Court of Pakistan",
    body: "Pending restraining-order matter requires counsel brief before next date.",
    to: "/external/$courtId/$category" as const,
    params: { courtId: "supreme-court", category: "restraining-order" },
    category: "hearing" as const,
  },
  {
    id: "n2",
    title: "Direction compliance — Federal Secretary",
    body: "Direction case record marked for departmental compliance report.",
    to: "/internal/$courtId/$category" as const,
    params: { courtId: "federal-secretary", category: "direction-cases" },
    category: "direction" as const,
  },
  {
    id: "n3",
    title: "Pending cases — Administrator",
    body: "Five pending cases require next-date requirement notes.",
    to: "/internal/$courtId/$category" as const,
    params: { courtId: "administrator", category: "pending-cases" },
    category: "pending" as const,
  },
  ...caseNotifications
    .filter((n) => !["n1", "n2", "n3"].includes(n.id))
    .map((n) => ({
      id: n.id,
      title: n.title,
      body: n.message,
      to:
        n.channel === "External Courts"
          ? ("/external/$courtId/$category" as const)
          : ("/internal/$courtId/$category" as const),
      params:
        n.category === "restraining"
          ? { courtId: "high-court", category: "restraining-order" }
          : n.category === "decided"
            ? { courtId: "other-courts", category: "decided-cases" }
            : { courtId: "chairman", category: "direction-cases" },
      category: n.category,
    })),
];

export const Route = createFileRoute("/_shell/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — IPS" }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Notifications"
        description="Hearing dates, restraining orders, and direction-case follow-ups for IPS litigation."
      />
      <Panel title="Recent alerts">
        <ul className="space-y-3">
          {pageItems.map((item) => {
            const meta = getNotificationMeta(item.category);
            return (
              <li
                key={item.id}
                className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
              >
                <NotificationCategoryIcon category={item.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  <Link
                    to={item.to}
                    params={item.params}
                    className="mt-2 inline-flex text-xs font-semibold text-primary-deep hover:underline"
                  >
                    Open register
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
