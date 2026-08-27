"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { primaryNav, secondaryNav } from "@/lib/nav-config";

function NavLink({ item, onNavigate }: { item: (typeof primaryNav)[number]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
  return (
    <Link
      href={item.href}
      data-testid={item.testId}
      data-ai-target={item.aiTarget}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {item.label}
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">F</div>
        <span className="text-lg font-semibold text-slate-900">FlowDesk</span>
      </div>
      <nav aria-label="Primary" className="flex-1 space-y-1 px-3">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <nav aria-label="Secondary" className="space-y-1 border-t border-slate-200 px-3 py-3">
        {secondaryNav.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block" data-testid="sidebar-desktop">
      <SidebarContent />
    </aside>
  );
}
