import Link from "next/link";
import { docArticles } from "@/lib/docs-content";
import { Card } from "@/components/ui/Misc";

export default function DocsIndexPage() {
  return (
    <div data-testid="docs-index-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Documentation</h1>
        <p className="mt-1 text-sm text-slate-500">Step-by-step guides for every FlowDesk feature.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {docArticles.map((a) => (
          <Link key={a.slug} href={`/docs/${a.slug}`} data-testid={`docs-link-${a.slug}`} data-ai-target={`docs-article-${a.slug}`}>
            <Card className="h-full p-4 transition-shadow hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">{a.category}</p>
              <p className="mt-1 font-medium text-slate-900">{a.title}</p>
              <p className="mt-1 text-sm text-slate-500">{a.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
