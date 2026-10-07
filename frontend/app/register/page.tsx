import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Register",
  description: stubPages.register.description,
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  const c = stubPages.register;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14" width="sm">
        <div className="space-y-5 border border-line bg-surface p-6 md:p-8">
          <Input id="full_name" name="full_name" label="Full name" disabled />
          <Input id="email" name="email" type="email" label="Email" disabled />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            disabled
          />
          <Button type="button" variant="lime" className="w-full" disabled>
            Create account (Phase 2)
          </Button>
          <p className="text-center text-sm text-ink-muted">
            Already registered?{" "}
            <Link href="/login" className="underline hover:text-petrol">
              Log in
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
