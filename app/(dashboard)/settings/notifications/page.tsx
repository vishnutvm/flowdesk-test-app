"use client";
import { useFlowDeskStore } from "@/lib/store";
import { SettingsShell } from "@/components/dashboard/SettingsShell";
import { Card, Skeleton, ErrorState } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import type { NotificationPrefs } from "@/lib/types";

const TOGGLES: { key: keyof NotificationPrefs; label: string; description: string; testId: string }[] = [
  { key: "email", label: "Email notifications", description: "Receive updates via email.", testId: "notif-toggle-email" },
  { key: "push", label: "Push notifications", description: "Receive updates as browser push notifications.", testId: "notif-toggle-push" },
  { key: "taskUpdates", label: "Task updates", description: "Get notified when tasks are assigned or change status.", testId: "notif-toggle-task-updates" },
  { key: "weeklyReport", label: "Weekly report", description: "Get a weekly summary of activity across your projects.", testId: "notif-toggle-weekly-report" },
];

export default function NotificationSettingsPage() {
  const prefs = useFlowDeskStore((s) => s.notificationPrefs);
  const updateNotificationPrefs = useFlowDeskStore((s) => s.updateNotificationPrefs);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);
  const { showToast } = useToast();

  if (dataError) {
    return (
      <SettingsShell title="Notifications" description="Choose what you want to be notified about, and how.">
        <ErrorState testId="notification-prefs-error-state" onRetry={() => initData()} />
      </SettingsShell>
    );
  }

  if (!dataLoaded) {
    return (
      <SettingsShell title="Notifications" description="Choose what you want to be notified about, and how.">
        <div data-testid="notification-prefs-loading" className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Notifications" description="Choose what you want to be notified about, and how.">
      <Card className="divide-y divide-slate-100 p-2">
        {TOGGLES.map((t) => {
          const checked = prefs[t.key];
          return (
            <div key={t.key} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{t.label}</p>
                <p className="text-sm text-slate-500">{t.description}</p>
              </div>
              <button
                role="switch"
                aria-checked={checked}
                aria-label={t.label}
                data-testid={t.testId}
                data-ai-target={t.testId}
                onClick={() => {
                  void updateNotificationPrefs({ [t.key]: !checked }).then(() => showToast(`${t.label} ${!checked ? "enabled" : "disabled"}.`));
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          );
        })}
      </Card>
    </SettingsShell>
  );
}
