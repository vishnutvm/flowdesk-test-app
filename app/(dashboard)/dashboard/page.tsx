"use client";
import Link from "next/link";
import { useFlowDeskStore } from "@/lib/store";
import { Card, Badge } from "@/components/ui/Misc";

export default function DashboardPage() {
  const currentUser = useFlowDeskStore((s) => s.currentUser);
  const projects = useFlowDeskStore((s) => s.projects);
  const tasks = useFlowDeskStore((s) => s.tasks);
  const teamMembers = useFlowDeskStore((s) => s.teamMembers);
  const notifications = useFlowDeskStore((s) => s.notifications);
  const organization = useFlowDeskStore((s) => s.organization);

  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const openTasks = tasks.filter((t) => t.status !== "Completed").length;
  const overdueTasks = tasks.filter((t) => t.status !== "Completed" && new Date(t.dueDate) < new Date("2026-08-26")).length;
  const activeMembers = teamMembers.filter((m) => m.status === "Active").length;

  const recentActivity = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const stats = [
    { label: "Active projects", value: activeProjects, testId: "stat-active-projects" },
    { label: "Open tasks", value: openTasks, testId: "stat-open-tasks" },
    { label: "Overdue tasks", value: overdueTasks, testId: "stat-overdue-tasks" },
    { label: "Team members", value: activeMembers, testId: "stat-team-members" },
  ];

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {currentUser?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening across {organization.name} today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.testId} data-testid={s.testId} className="p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
            <Link href="/notifications" data-testid="dashboard-view-all-activity" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <ul data-testid="recent-activity-list" className="divide-y divide-slate-100">
            {recentActivity.map((n) => (
              <li key={n.id} data-testid="activity-item" className="flex items-start gap-3 py-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-sm text-slate-500">{n.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/projects?new=1"
                data-testid="quick-action-new-project"
                data-ai-target="quick-action-new-project"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                + New project
              </Link>
              <Link
                href="/tasks?new=1"
                data-testid="quick-action-new-task"
                data-ai-target="quick-action-new-task"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                + New task
              </Link>
              <Link
                href="/team?invite=1"
                data-testid="quick-action-invite-member"
                data-ai-target="quick-action-invite-member"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                + Invite team member
              </Link>
            </div>
          </Card>

          <Card className="p-5" data-testid="plan-usage-card">
            <h2 className="text-base font-semibold text-slate-900">Plan & usage</h2>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Current plan</span>
              <Badge testId="dashboard-current-plan">{organization.plan}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Projects used</span>
              <span className="font-medium text-slate-800">{projects.length} / 20</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-500">Team seats used</span>
              <span className="font-medium text-slate-800">{teamMembers.length} / 15</span>
            </div>
            <Link href="/settings/billing" data-testid="dashboard-manage-billing" className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Manage billing
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
