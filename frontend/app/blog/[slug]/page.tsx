import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <PageHeader eyebrow="Article" title={slug.replace(/-/g, " ")} />
      <Container className="py-14">
        <p className="text-ink-muted">Article body connects in Phase 2.</p>
        <div className="mt-8">
          <Button href="/blog" variant="secondary">
            All posts
          </Button>
        </div>
      </Container>
    </>
  );
}
