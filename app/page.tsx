import Link from "next/link";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed-data";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">F</div>
          <span className="text-lg font-semibold text-slate-900">FlowDesk</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" data-testid="landing-login-link" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/signup"
            data-testid="landing-signup-link"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Run projects, tasks and customer work in one place.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          FlowDesk is a demo project-and-team-management SaaS used as a testing target for an external chatbot
          integration. Every workflow is mocked — sign up or use the demo account to explore.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            data-testid="landing-get-started"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            data-testid="landing-try-demo"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Try the demo
          </Link>
        </div>
        <div className="mt-8 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Demo credentials — Email: <strong>{DEMO_EMAIL}</strong> · Password: <strong>{DEMO_PASSWORD}</strong>
        </div>
      </main>

      <footer className="border-t border-slate-100 px-6 py-6 text-center text-sm text-slate-400">
        FlowDesk is a fictional product built for integration testing purposes only.
      </footer>
    </div>
  );
}
