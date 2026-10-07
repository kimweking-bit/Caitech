import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  alternates: { canonical: "/reset-password" },
};

export default function ResetPasswordPage() {
  const c = stubPages.resetPassword;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14" width="sm">
        <div className="space-y-5 border border-line bg-surface p-6 md:p-8">
          <Input
            id="password"
            name="password"
            type="password"
            label="New password"
            disabled
          />
          <Input
            id="password_confirm"
            name="password_confirm"
            type="password"
            label="Confirm password"
            disabled
          />
          <Button type="button" variant="primary" className="w-full" disabled>
            Update password (Phase 2)
          </Button>
        </div>
      </Container>
    </>
  );
}
