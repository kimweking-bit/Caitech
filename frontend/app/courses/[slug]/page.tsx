import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Course · ${slug}`,
    alternates: { canonical: `/courses/${slug}` },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Course"
        title={slug.replace(/-/g, " ")}
        description="Full course product page (modules, outcomes, enrollment) ships in Phase 2."
      />
      <Container className="py-14">
        <Button href="/courses" variant="secondary">
          All courses
        </Button>
      </Container>
    </>
  );
}
