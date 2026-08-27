import Link from "next/link";
import { docArticles } from "@/lib/docs-content";
import { Card } from "@/components/ui/Misc";

export default function HelpPage() {
  const categories = Array.from(new Set(docArticles.map((a) => a.category)));

  return (
    <div data-testid="help-page" className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Help center</h1>
        <p className="mt-1 text-sm text-slate-500">Find answers to common questions about using FlowDesk.</p>
      </div>

      {categories.map((category) => (
        <div key={category} data-testid={`help-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {docArticles
              .filter((a) => a.category === category)
              .map((a) => (
                <Link key={a.slug} href={`/docs/${a.slug}`} data-testid={`help-article-link-${a.slug}`} data-ai-target={`help-article-${a.slug}`}>
                  <Card className="h-full p-4 transition-shadow hover:shadow-md">
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{a.summary}</p>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
