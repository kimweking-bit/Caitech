import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Courses",
  description: stubPages.courses.description,
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  const c = stubPages.courses;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14 md:py-16">
        <p className="max-w-2xl text-ink-muted leading-relaxed">
          Full catalog filters, search, and live listings ship in Phase 2. The
          homepage already connects to the courses API when available.
        </p>
        <div className="mt-8">
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </Container>
    </>
  );
}
