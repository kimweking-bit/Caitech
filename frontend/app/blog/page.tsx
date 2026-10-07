import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { blogTeaser, stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Blog",
  description: stubPages.blog.description,
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const c = stubPages.blog;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14">
        <p className="text-ink-muted">{blogTeaser.emptyBody}</p>
      </Container>
    </>
  );
}
