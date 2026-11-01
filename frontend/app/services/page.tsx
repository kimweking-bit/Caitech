import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  disciplines,
  outcomes,
  instituteMission,
} from "@/lib/content/institute";

export const metadata: Metadata = {
  title: "Services | CAITECH Global Institute",
  description:
    "Technical education and applied-skills services from CAITECH Global Institute — CAD, engineering, ICT, building technology, electronics, data, and design training in Nairobi.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Services hero — shared .page-hero stage + courses background */}
      <section className="page-hero overflow-hidden border-b border-line text-white">
        <Container className="w-full py-10 md:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                Services · Nairobi CBD
              </p>
              <div className="mt-3 h-0.5 w-12 rounded-full bg-lime" aria-hidden />
              <h1 className="mt-4 max-w-2xl font-display text-3xl leading-[1.1] text-balance text-white md:text-4xl lg:text-[2.85rem]">
                Technical Skills.
                <span className="block text-lime">Practical Solutions.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
                {instituteMission}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/courses" variant="lime" size="lg">
                  Explore courses
                </Button>
                <Button
                  href="/contact"
                  variant="ghost"
                  size="lg"
                  className="border-2 border-white/55 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
                >
                  Talk to admissions
                </Button>
              </div>
            </div>
            <div className="relative aspect-[16/11] max-h-[min(22rem,42svh)] w-full overflow-hidden rounded-[var(--radius-lg)] border border-white/15 shadow-[var(--shadow-lg)] sm:max-h-none">
              <Image
                src="/images/home/discipline-engineering-v2.jpg"
                alt="Engineering technology practice at CAITECH"
                fill
                priority
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-petrol-deep/50 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/90">
                Applied schools · CAD · Engineering · ICT · Design
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-tint-soft border-b border-line py-14 md:py-20">
        <Container>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Learning areas
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl text-petrol md:text-4xl">
            Schools and technical services
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            CAITECH organises training across verified schools — CAD and design
            technology, engineering, ICT, building, electronics, data, media,
            and creative practice — with software and site methods used in
            industry.
          </p>

          <ul className="mt-10 m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
            {disciplines.map((d) => (
              <li key={d.id} className="h-full">
                <Link
                  href="/courses"
                  className="card-premium group relative flex h-full flex-col overflow-hidden p-6 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] focus-visible:ring-offset-2 md:p-7"
                  aria-label={`${d.name} — explore related courses`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-1 top-3 select-none font-display text-[4.5rem] leading-none text-petrol/[0.08] md:text-[5.25rem]"
                  >
                    {d.number}
                  </span>

                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-petrol-muted">
                      <span className="font-semibold text-petrol-deep">{d.number}</span>
                      <span className="mx-2 text-petrol/25" aria-hidden>
                        ·
                      </span>
                      {d.shortName}
                    </p>
                    <span
                      aria-hidden
                      className="mt-3 block h-0.5 w-8 rounded-full bg-lime"
                    />
                    <h3 className="mt-4 font-display text-xl leading-snug text-petrol-deep transition-colors group-hover:text-petrol md:text-[1.35rem]">
                      {d.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/80">
                      {d.summary}
                    </p>
                    {d.tools.length > 0 ? (
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-petrol-muted">
                        {d.tools.slice(0, 4).join(" · ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="relative mt-auto flex items-center justify-between border-t border-petrol/15 pt-4">
                    <span className="text-sm font-semibold text-petrol-deep transition-colors group-hover:text-petrol">
                      Explore pathway
                    </span>
                    <span
                      aria-hidden
                      className="text-base font-semibold text-petrol-deep transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section-tint-soft border-b border-line py-14 md:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-petrol/15 shadow-[var(--shadow-md)]">
              <Image
                src="/images/home/hero-electronics-workshop-v3.jpg"
                alt="Applied technical workshop practice"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-petrol/25 via-transparent to-transparent"
              />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-petrol-muted">
                Practical learning
              </p>
              <span
                aria-hidden
                className="mt-3 block h-0.5 w-10 rounded-full bg-lime"
              />
              <h2 className="mt-4 font-display text-3xl text-petrol-deep md:text-4xl">
                Tools, workflows, and applied projects
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/80">
                Training is oriented to the software, standards, and project
                habits graduates use on real briefs — documentation, modelling,
                analysis, systems work, and hands-on repair or construction
                practice.
              </p>
              <ul className="mt-7 m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                {outcomes.map((o) => (
                  <li
                    key={o.verb}
                    className="rounded-[var(--radius-md)] border border-petrol/10 border-l-[3px] border-l-lime bg-surface/90 px-4 py-3.5 shadow-[var(--shadow-sm)]"
                  >
                    <p className="font-display text-base font-semibold text-petrol-deep">
                      {o.verb}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/75">
                      {o.line}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-t border-line bg-petrol py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 70% at 90% 20%, color-mix(in oklab, var(--color-lime) 14%, transparent), transparent 65%), radial-gradient(ellipse 40% 50% at 10% 90%, color-mix(in oklab, var(--color-cyan) 12%, transparent), transparent 60%)",
          }}
          aria-hidden
        />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
              Next step
            </p>
            <h2 className="mt-3 font-display text-3xl text-ground text-balance md:text-4xl">
              Ready to train with industry tools?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ground/75 md:text-lg">
              Browse the course catalogue or contact the Nairobi team about
              admissions, schedules, and the right programme for your goals.
            </p>
            <div className="mt-9 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button href="/courses" variant="lime" size="lg">
                Browse courses
              </Button>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border-2 border-ground/55 bg-transparent px-5 text-base font-semibold tracking-wide text-ground transition-[color,background-color,border-color] duration-160 hover:border-ground hover:bg-ground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cyan)]"
              >
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
