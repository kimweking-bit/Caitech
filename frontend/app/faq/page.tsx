import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "FAQ",
  description: stubPages.faq.description,
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "What does CAITECH teach?",
    a: "Technical programs across CAD and design technology, engineering fundamentals, ICT and networking, electronics repairs, building technology, data analytics, and related applied skills.",
  },
  {
    q: "How do payments work?",
    a: "Checkout runs through the CAITECH payment flow on the platform. Local-friendly methods including M-Pesa-oriented checkout are supported by the backend payment service.",
  },
  {
    q: "Is AI Path a chatbot?",
    a: "No. AI Path is a structured questionnaire that recommends a course sequence from your goals and background.",
  },
] as const;

export default function FaqPage() {
  const c = stubPages.faq;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14 md:py-16">
        <dl className="mx-auto max-w-2xl divide-y divide-line border border-line bg-surface">
          {faqs.map((item) => (
            <div key={item.q} className="px-6 py-5 md:px-8">
              <dt className="font-display text-xl text-petrol">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted md:text-base">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </>
  );
}
