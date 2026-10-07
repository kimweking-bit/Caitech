import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Category · ${slug}`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={slug.replace(/-/g, " ")}
        description="Category listings connect to the courses API in Phase 2."
      />
      <Container className="py-14">
        <Button href="/courses" variant="secondary">
          Browse courses
        </Button>
      </Container>
    </>
  );
}
