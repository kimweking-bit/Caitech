"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitLearningPath } from "@/lib/api/ai-path";
import { ApiError, fieldErrors } from "@/lib/api/client";
import type { LearningPathResult } from "@/types/api";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export default function AiPathPage() {
  const [goals, setGoals] = useState("");
  const [interests, setInterests] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [hours, setHours] = useState("10");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LearningPathResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    const h = Number(hours);
    if (!Number.isFinite(h) || h < 1) {
      setFields({ hours_per_week: "Enter hours between 1 and 168." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitLearningPath({
        goals: goals.trim(),
        interests: interests.trim(),
        current_skill_level: level,
        hours_per_week: h,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website,
      });
      setResult(res);
    } catch (err) {
      setFields(fieldErrors(err));
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not generate a learning path. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setResult(null);
    setError(null);
    setFields({});
  }

  return (
    <>
      <PageHeader
        eyebrow="Guidance"
        title="AI learning path"
        description="Answer a short questionnaire. CAITECH maps your goals to published programmes — recommendations come from the institute API, not invented marketing."
      />
      <Container className="py-10 md:py-14">
        {result ? (
          <div className="mx-auto max-w-3xl space-y-10">
            <div className="border border-line bg-surface px-6 py-8 md:px-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Result · {result.status}
              </p>
              <h2 className="mt-3 font-display text-2xl text-petrol md:text-3xl">
                Your path summary
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink-muted">
                {result.recommendation_summary ||
                  "No summary was returned for this submission."}
              </p>
            </div>

            {result.recommendations?.length ? (
              <section aria-labelledby="recs-heading">
                <h2
                  id="recs-heading"
                  className="font-display text-2xl text-petrol"
                >
                  Recommended programmes
                </h2>
                <ul className="mt-6 list-none space-y-0 divide-y divide-line border border-line p-0">
                  {result.recommendations.map((r) => (
                    <li key={`${r.course_id}-${r.slug}`} className="p-5 md:p-6">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                        {[r.course_type, r.duration, r.intake_status]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <h3 className="mt-2 font-display text-xl text-petrol">
                        <Link
                          href={`/courses/${r.slug}`}
                          className="no-underline hover:underline"
                        >
                          {r.title}
                        </Link>
                      </h3>
                      {r.delivery_modes?.length ? (
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                          {r.delivery_modes.join(" · ")}
                        </p>
                      ) : null}
                      {r.reason ? (
                        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                          {r.reason}
                        </p>
                      ) : null}
                      <Link
                        href={`/courses/${r.slug}`}
                        className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.12em] text-petrol"
                      >
                        View programme →
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="border border-line px-6 py-10 text-center">
                <p className="font-display text-xl text-petrol">
                  No programme matches yet
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  Try adjusting goals or interests, or browse the full
                  catalogue.
                </p>
                <div className="mt-6">
                  <Button href="/courses" variant="lime">
                    Browse courses
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={restart}>
                Start again
              </Button>
              <Button href="/courses" variant="lime">
                Course catalogue
              </Button>
              <Button href="/contact" variant="ghost">
                Talk to admissions
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto max-w-xl space-y-6"
            noValidate
          >
            {error ? (
              <p
                role="alert"
                className="border border-line bg-surface px-3 py-2 text-sm text-petrol"
              >
                {error}
              </p>
            ) : null}

            <div className="absolute -left-[9999px] opacity-0" aria-hidden>
              <label htmlFor="ai-website">Website</label>
              <input
                id="ai-website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <Textarea
              id="goals"
              label="Goals"
              name="goals"
              required
              rows={4}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              disabled={submitting}
              error={fields.goals}
              hint="What do you want to achieve in the next 6–18 months?"
            />

            <Textarea
              id="interests"
              label="Interests"
              name="interests"
              required
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              disabled={submitting}
              error={fields.interests}
              hint="e.g. CAD, BIM, ICT, electronics, surveying, design…"
            />

            <fieldset>
              <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                Current skill level
              </legend>
              <div className="flex flex-wrap gap-3">
                {LEVELS.map((l) => (
                  <label
                    key={l.value}
                    className="flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-sm text-petrol has-[:checked]:border-petrol has-[:checked]:bg-petrol has-[:checked]:text-ground"
                  >
                    <input
                      type="radio"
                      name="level"
                      value={l.value}
                      checked={level === l.value}
                      onChange={() => setLevel(l.value)}
                      disabled={submitting}
                      className="sr-only"
                    />
                    {l.label}
                  </label>
                ))}
              </div>
              {fields.current_skill_level ? (
                <p className="mt-1 text-xs text-petrol">
                  {fields.current_skill_level}
                </p>
              ) : null}
            </fieldset>

            <Input
              id="hours"
              label="Hours per week you can study"
              type="number"
              name="hours_per_week"
              min={1}
              max={168}
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              disabled={submitting}
              error={fields.hours_per_week}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="name"
                label="Name (optional)"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                error={fields.name}
              />
              <Input
                id="email"
                label="Email (optional)"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                error={fields.email}
              />
            </div>

            <Input
              id="phone"
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
              error={fields.phone}
            />

            <Button
              type="submit"
              variant="lime"
              className="w-full justify-center sm:w-auto"
              disabled={submitting}
            >
              {submitting ? "Building your path…" : "Get recommendations"}
            </Button>
          </form>
        )}
      </Container>
    </>
  );
}
