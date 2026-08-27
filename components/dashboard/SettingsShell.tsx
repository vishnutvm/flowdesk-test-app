"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { settingsNav } from "@/lib/nav-config";

export function SettingsShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div data-testid="settings-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account, team, and organization preferences.</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <nav aria-label="Settings" data-testid="settings-nav" className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {settingsNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                data-ai-target={item.aiTarget}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
