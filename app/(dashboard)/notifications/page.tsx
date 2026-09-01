"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useFlowDeskStore } from "@/lib/store";
import { Card, EmptyState, Skeleton, ErrorState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";

const FILTERS = ["all", "unread", "read"] as const;

export default function NotificationsPage() {
  const notifications = useFlowDeskStore((s) => s.notifications);
  const markNotificationRead = useFlowDeskStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useFlowDeskStore((s) => s.markAllNotificationsRead);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const filtered = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter === "unread") return sorted.filter((n) => !n.read);
    if (filter === "read") return sorted.filter((n) => n.read);
    return sorted;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div data-testid="notifications-page" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.</p>
        </div>
        <Button data-testid="mark-all-read-button" data-ai-target="mark-all-read-button" variant="outline" onClick={markAllNotificationsRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      <div className="flex items-center gap-2" role="tablist" aria-label="Filter notifications">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            data-testid={`notifications-filter-${f}`}
            data-ai-target={`notifications-filter-${f}`}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-sm font-medium capitalize",
              filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {dataError ? (
        <ErrorState testId="notifications-error-state" onRetry={() => initData()} />
      ) : !dataLoaded ? (
        <div data-testid="notifications-loading" className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState testId="notifications-empty-state" title="No notifications" description="You're all caught up — nothing to see here." />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {filtered.map((n) => (
              <li
                key={n.id}
                data-testid={`notification-item-${n.id}`}
                className={clsx("flex items-start justify-between gap-4 px-5 py-4", !n.read && "bg-indigo-50/40")}
              >
                <div className="flex items-start gap-3">
                  <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-slate-300" : "bg-indigo-500")} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="text-sm text-slate-500">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!n.read && (
                  <button
                    data-testid={`mark-read-${n.id}`}
                    data-ai-target="mark-notification-read"
                    onClick={() => markNotificationRead(n.id)}
                    className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
