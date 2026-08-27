"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useFlowDeskStore } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const signup = useFlowDeskStore((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const result = signup(name, email, password);
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Unable to create account.");
        return;
      }
      setSuccess(true);
    }, 400);
  }

  if (success) {
    return (
      <Card className="p-8 text-center" data-testid="signup-success">
        <h1 className="text-xl font-semibold text-slate-900">Account created</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your FlowDesk account has been created. You can now log in with your email and password.
        </p>
        <Button className="mt-6 w-full" data-testid="signup-go-to-login" onClick={() => router.push("/login")}>
          Go to login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Start managing projects and teams with FlowDesk.</p>

      <form data-testid="signup-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          id="signup-name"
          data-testid="signup-name-input"
          data-ai-target="signup-name"
          label="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="signup-email"
          data-testid="signup-email-input"
          data-ai-target="signup-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="signup-password"
          data-testid="signup-password-input"
          data-ai-target="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with uppercase, lowercase, a number and a symbol."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          id="signup-confirm-password"
          data-testid="signup-confirm-password-input"
          data-ai-target="signup-confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <p role="alert" data-testid="signup-error" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" data-testid="signup-submit" data-ai-target="signup-submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" data-testid="go-to-login" data-ai-target="go-to-login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </Card>
  );
}
