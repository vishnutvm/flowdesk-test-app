"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlowDeskStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const isAuthenticated = useFlowDeskStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login?redirected=1");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div data-testid="auth-loading" className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main data-testid="main-content" className="flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
