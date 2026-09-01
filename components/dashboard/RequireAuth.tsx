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
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataLoading = useFlowDeskStore((s) => s.dataLoading);
  const initData = useFlowDeskStore((s) => s.initData);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login?redirected=1");
    }
  }, [hydrated, isAuthenticated, router]);

  // Kick off the initial fetch of business data (projects, tasks, etc.) from
  // MongoDB once per authenticated session. Individual pages own their own
  // loading/error UI based on the shared dataLoading/dataError/dataLoaded
  // flags this populates.
  useEffect(() => {
    if (hydrated && isAuthenticated && !dataLoaded && !dataLoading) {
      void initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated, dataLoaded]);

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
