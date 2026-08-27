"use client";
import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useFlowDeskStore } from "@/lib/store";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useFlowDeskStore((s) => s.resetPassword);

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const result = resetPassword(email, password);
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Unable to reset password.");
        return;
      }
      setSuccess(true);
    }, 400);
  }

  if (success) {
    return (
      <Card className="p-8 text-center" data-testid="reset-password-success">
        <h1 className="text-xl font-semibold text-slate-900">Password reset</h1>
        <p className="mt-2 text-sm text-slate-500">Your password has been updated. You can now log in.</p>
        <Button className="mt-6 w-full" data-testid="reset-password-go-to-login" onClick={() => router.push("/login")}>
          Go to login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-xl font-semibold text-slate-900">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a new password for your account.</p>

      <form data-testid="reset-password-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          id="reset-email"
          data-testid="reset-password-email-input"
          data-ai-target="reset-password-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="reset-new-password"
          data-testid="reset-password-new-input"
          data-ai-target="reset-password-new"
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with uppercase, lowercase, a number and a symbol."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          id="reset-confirm-password"
          data-testid="reset-password-confirm-input"
          data-ai-target="reset-password-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && (
          <p role="alert" data-testid="reset-password-error" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" data-testid="reset-password-submit" data-ai-target="reset-password-submit" className="w-full" isLoading={isLoading}>
          Reset password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
