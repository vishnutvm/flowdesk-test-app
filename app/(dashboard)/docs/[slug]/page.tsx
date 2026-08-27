import { notFound } from "next/navigation";
import Link from "next/link";
import { docArticles, getDocArticle } from "@/lib/docs-content";
import { Card } from "@/components/ui/Misc";

export function generateStaticParams() {
  return docArticles.map((a) => ({ slug: a.slug }));
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getDocArticle(slug);
  if (!article) notFound();

  return (
    <div data-testid="doc-article-page" className="mx-auto max-w-2xl space-y-6">
      <Link href="/docs" data-testid="back-to-docs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
        ← All documentation
      </Link>
      <Card className="p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">{article.category}</p>
        <h1 data-testid="doc-article-title" className="mt-1 text-2xl font-semibold text-slate-900">
          {article.title}
        </h1>
        <div data-testid="doc-article-body" className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
          {article.body.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
        <Link
          href={article.relatedPath}
          data-testid="doc-article-related-link"
          data-ai-target={`doc-article-related-${article.slug}`}
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Go to the related page →
        </Link>
      </Card>
    </div>
  );
}
