import { RequireAuth } from "@/components/dashboard/RequireAuth";

// This entire route group is a CSR dashboard shell gated by a client-side
// mocked auth check (see RequireAuth). There is no server data to prerender,
// and forcing dynamic rendering avoids build-time static generation trying
// to execute browser-only logic (localStorage-backed session state).
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
