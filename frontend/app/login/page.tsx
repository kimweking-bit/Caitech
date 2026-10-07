import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Log in",
  description: stubPages.login.description,
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

/** Shell form only — auth wiring in Phase 2. */
export default function LoginPage() {
  const c = stubPages.login;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14" width="sm">
        <div className="space-y-5 border border-line bg-surface p-6 md:p-8">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            disabled
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            disabled
          />
          <Button type="button" variant="lime" className="w-full" disabled>
            Log in (connects in Phase 2)
          </Button>
          <p className="text-center text-sm text-ink-muted">
            <Link href="/forgot-password" className="underline hover:text-petrol">
              Forgot password
            </Link>
            {" · "}
            <Link href="/register" className="underline hover:text-petrol">
              Register
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
