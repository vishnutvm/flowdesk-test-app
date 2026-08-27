"use client";
import { useEffect, useState } from "react";

/**
 * The FlowDesk store is persisted to localStorage via zustand's `persist`
 * middleware. zustand's React binding uses `useSyncExternalStore`, which —
 * to keep the first client render consistent with the server-rendered HTML —
 * returns the pre-hydration (server) snapshot on that very first client
 * render, even though the store itself has already synchronously read
 * localStorage by then. Reading `persist.hasHydrated()` in a `useState`
 * initializer raced ahead of that: it flipped `hydrated` to `true` on the
 * same first render where `useFlowDeskStore(s => s.isAuthenticated)` still
 * reported the stale unauthenticated snapshot, causing a spurious redirect
 * to /login for an already-logged-in user.
 *
 * The fix is to only flip `hydrated` from a plain `useEffect`, which always
 * runs after React has committed and reconciled the client render — by then
 * every selector reads the real, live client store state.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Intentional: this is the standard "client has mounted" flag used to
    // defer client-only rendering past the SSR/hydration-safe first pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  return hydrated;
}
