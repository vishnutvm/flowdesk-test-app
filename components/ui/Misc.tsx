"use client";
import clsx from "clsx";

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white shadow-sm", className)} {...rest}>
      {children}
    </div>
  );
}

const badgeColors: Record<string, string> = {
  // project / task statuses
  Planning: "bg-slate-100 text-slate-700",
  Active: "bg-emerald-100 text-emerald-700",
  Completed: "bg-indigo-100 text-indigo-700",
  Archived: "bg-slate-100 text-slate-500",
  Todo: "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Review: "bg-amber-100 text-amber-700",
  // priorities
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
  // customer statuses
  Lead: "bg-amber-100 text-amber-700",
  Churned: "bg-red-100 text-red-700",
  // roles
  Owner: "bg-purple-100 text-purple-700",
  Admin: "bg-indigo-100 text-indigo-700",
  Member: "bg-blue-100 text-blue-700",
  Viewer: "bg-slate-100 text-slate-600",
  Invited: "bg-amber-100 text-amber-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Due: "bg-amber-100 text-amber-700",
};

export function Badge({ children, testId }: { children: string; testId?: string }) {
  return (
    <span
      data-testid={testId}
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeColors[children] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  testId,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId ?? "empty-state"}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center"
    >
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div data-testid="loading-skeleton" className={clsx("animate-pulse rounded-md bg-slate-200", className)} />;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't complete this request. Check your connection and try again.",
  onRetry,
  testId,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId ?? "error-state"}
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <h3 className="text-base font-semibold text-red-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-red-600">{description}</p>
      {onRetry && (
        <button
          data-testid="error-state-retry"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function PermissionDenied({ action = "perform this action" }: { action?: string }) {
  return (
    <div data-testid="permission-denied" role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
      <h3 className="text-base font-semibold text-amber-800">Permission required</h3>
      <p className="mt-1.5 text-sm text-amber-700">
        Your current role does not allow you to {action}. Ask an Owner or Admin for access.
      </p>
    </div>
  );
}
