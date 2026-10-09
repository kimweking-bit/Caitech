"use client";

import { PageHeader } from "@/components/portal/PageHeader";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function StudentCertificatesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Credentials"
        title="Certificates"
        description="Official programme certificates will appear here when the institute enables certificate issuance."
      />
      <EmptyState
        title="No certificates available"
        description="Certificate generation is not enabled on the backend yet. Complete your programmes and progress will still be tracked in My Learning."
        action={
          <Button href="/student/learning" variant="secondary">
            View my learning
          </Button>
        }
      />
    </div>
  );
}
