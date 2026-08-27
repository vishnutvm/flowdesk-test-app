"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlowDeskStore } from "@/lib/store";
import { SidebarContent } from "./Sidebar";

export function Topbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = useFlowDeskStore((s) => s.currentUser);
  const logout = useFlowDeskStore((s) => s.logout);
  const unreadCount = useFlowDeskStore((s) => s.notifications.filter((n) => !n.read).length);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            data-testid="mobile-menu-toggle"
            data-ai-target="mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            data-testid="topbar-notifications"
            data-ai-target="topbar-notifications"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                data-testid="notifications-unread-badge"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
              >
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              data-testid="user-menu-toggle"
              data-ai-target="user-menu-toggle"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser?.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full bg-slate-200"
              />
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">{currentUser?.name}</span>
            </button>
            {menuOpen && (
              <div
                role="menu"
                data-testid="user-menu"
                className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              >
                <Link
                  href="/settings/profile"
                  data-testid="user-menu-profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Profile settings
                </Link>
                <button
                  data-testid="user-menu-logout"
                  data-ai-target="logout-button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div data-testid="sidebar-mobile" className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex justify-end p-2">
              <button
                data-testid="mobile-menu-close"
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
