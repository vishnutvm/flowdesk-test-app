"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useFlowDeskStore } from "@/lib/store";

export default function ForgotPasswordPage() {
  const requestPasswordReset = useFlowDeskStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const result = requestPasswordReset(email);
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Unable to process request.");
        return;
      }
      setSent(true);
    }, 400);
  }

  if (sent) {
    return (
      <Card className="p-8 text-center" data-testid="forgot-password-sent">
        <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-500">
          If an account exists for {email}, we&apos;ve sent a link to reset your password. In this demo app, continue directly to the reset page.
        </p>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`} data-testid="continue-to-reset" className="mt-6 inline-block">
          <Button className="w-full">Continue to reset password</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-xl font-semibold text-slate-900">Forgot your password?</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your email and we&apos;ll send you a reset link.</p>

      <form data-testid="forgot-password-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          id="forgot-email"
          data-testid="forgot-password-email-input"
          data-ai-target="forgot-password-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && (
          <p role="alert" data-testid="forgot-password-error" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" data-testid="forgot-password-submit" data-ai-target="forgot-password-submit" className="w-full" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" data-testid="back-to-login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
