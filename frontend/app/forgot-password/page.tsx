import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  const c = stubPages.forgotPassword;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14" width="sm">
        <div className="space-y-5 border border-line bg-surface p-6 md:p-8">
          <Input id="email" name="email" type="email" label="Email" disabled />
          <Button type="button" variant="primary" className="w-full" disabled>
            Send reset link (Phase 2)
          </Button>
          <p className="text-center text-sm text-ink-muted">
            <Link href="/login" className="underline hover:text-petrol">
              Back to log in
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
