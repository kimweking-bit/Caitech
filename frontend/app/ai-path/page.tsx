import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { aiPath, stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "AI Learning Path",
  description: stubPages.aiPath.description,
  alternates: { canonical: "/ai-path" },
};

export default function AiPathPage() {
  const c = stubPages.aiPath;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14 md:py-16">
        <p className="max-w-2xl text-ink-muted leading-relaxed">{aiPath.body}</p>
        <p className="mt-4 max-w-2xl text-sm text-ink-muted">
          Interactive questionnaire and recommendation UI ships next. Backend
          endpoints <code className="font-mono text-xs">POST /api/v1/ai-path/</code>{" "}
          already exist.
        </p>
        <div className="mt-8">
          <Button href="/courses" variant="lime">
            Browse courses meanwhile
          </Button>
        </div>
      </Container>
    </>
  );
}
