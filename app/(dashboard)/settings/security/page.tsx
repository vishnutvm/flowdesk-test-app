"use client";
import { useState, FormEvent } from "react";
import { useFlowDeskStore } from "@/lib/store";
import { SettingsShell } from "@/components/dashboard/SettingsShell";
import { Card, Skeleton, ErrorState } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function SecuritySettingsPage() {
  const changePassword = useFlowDeskStore((s) => s.changePassword);
  const loginHistory = useFlowDeskStore((s) => s.loginHistory);
  const activeSessions = useFlowDeskStore((s) => s.activeSessions);
  const revokeSession = useFlowDeskStore((s) => s.revokeSession);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);
  const { showToast } = useToast();

  const [twoFA, setTwoFA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const result = changePassword(currentPassword, newPassword);
      setIsSaving(false);
      if (!result.ok) {
        setError(result.error ?? "Could not change password.");
        return;
      }
      showToast("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 350);
  }

  if (dataError) {
    return (
      <SettingsShell title="Security" description="Manage your password, two-factor authentication, and active sessions.">
        <ErrorState testId="security-error-state" onRetry={() => initData()} />
      </SettingsShell>
    );
  }

  if (!dataLoaded) {
    return (
      <SettingsShell title="Security" description="Manage your password, two-factor authentication, and active sessions.">
        <div data-testid="security-loading" className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Security" description="Manage your password, two-factor authentication, and active sessions.">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900">Change password</h3>
        <form data-testid="change-password-form" onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <Input
            id="current-password"
            data-testid="current-password-input"
            data-ai-target="current-password"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            id="new-password"
            data-testid="new-password-input"
            data-ai-target="new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters, with uppercase, lowercase, a number and a symbol."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            id="confirm-password"
            data-testid="confirm-password-input"
            data-ai-target="confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && (
            <p role="alert" data-testid="change-password-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end pt-2">
            <Button type="submit" data-testid="save-password" data-ai-target="save-password" isLoading={isSaving}>
              Save password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Two-factor authentication</h3>
            <p className="mt-1 text-sm text-slate-500">Add an extra layer of security when you log in.</p>
          </div>
          <button
            role="switch"
            aria-checked={twoFA}
            data-testid="2fa-toggle"
            data-ai-target="2fa-toggle"
            onClick={() => {
              setTwoFA((v) => !v);
              showToast(twoFA ? "Two-factor authentication disabled." : "Two-factor authentication enabled.");
            }}
            className={`relative h-6 w-11 rounded-full transition-colors ${twoFA ? "bg-indigo-600" : "bg-slate-200"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900">Active sessions</h3>
        <ul data-testid="active-sessions-list" className="mt-3 divide-y divide-slate-100">
          {activeSessions.map((s) => (
            <li key={s.id} data-testid={`session-${s.id}`} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">
                  {s.device} {s.current && <span className="ml-1 text-xs font-normal text-emerald-600">(this device)</span>}
                </p>
                <p className="text-slate-500">{s.location} · last active {new Date(s.lastActive).toLocaleString()}</p>
              </div>
              {!s.current && (
                <button
                  data-testid={`revoke-session-${s.id}`}
                  onClick={() => {
                    void revokeSession(s.id).then(() => showToast("Session revoked."));
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900">Login history</h3>
        <ul data-testid="login-history-list" className="mt-3 divide-y divide-slate-100">
          {loginHistory.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{entry.device}</p>
                <p className="text-slate-500">{entry.location} · {entry.ip}</p>
              </div>
              <div className="text-right">
                <p className={entry.success ? "text-emerald-600" : "text-red-600"}>{entry.success ? "Success" : "Failed attempt"}</p>
                <p className="text-xs text-slate-400">{new Date(entry.at).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </SettingsShell>
  );
}
