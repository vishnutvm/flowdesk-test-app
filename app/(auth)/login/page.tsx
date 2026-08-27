"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useFlowDeskStore } from "@/lib/store";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed-data";

export default function LoginPage() {
  const router = useRouter();
  const login = useFlowDeskStore((s) => s.login);
  const sessionExpired = useFlowDeskStore((s) => s.sessionExpired);
  const clearSessionExpired = useFlowDeskStore((s) => s.clearSessionExpired);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    clearSessionExpired();
    // Simulate network latency for a realistic loading state.
    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Unable to sign in.");
        return;
      }
      router.push("/dashboard");
    }, 400);
  }

  return (
    <Card className="p-8">
      <h1 className="text-xl font-semibold text-slate-900">Log in to FlowDesk</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your details to continue.</p>

      {sessionExpired && (
        <div data-testid="session-expired-banner" role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your session expired. Please log in again.
        </div>
      )}

      <div data-testid="demo-credentials-hint" className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-800">
        Demo credentials — Email: <strong>{DEMO_EMAIL}</strong> · Password: <strong>{DEMO_PASSWORD}</strong>
      </div>

      <form data-testid="login-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          id="login-email"
          data-testid="login-email-input"
          data-ai-target="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="login-password"
          data-testid="login-password-input"
          data-ai-target="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p role="alert" data-testid="login-error" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" data-testid="forgot-password-link" data-ai-target="forgot-password-link" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" data-testid="login-submit" data-ai-target="login-submit" className="w-full" isLoading={isLoading}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" data-testid="go-to-signup" data-ai-target="go-to-signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
