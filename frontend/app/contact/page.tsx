"use client";

import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitContact } from "@/lib/api/content";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { instituteContact } from "@/lib/content/institute";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSubmitting(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        website,
      });
      setDone(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setFields(fieldErrors(err));
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the institute"
        description="Admissions, programmes, schedules and campus visits — write to CAITECH or call the Nairobi office."
      />
      <Container className="py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
          <div>
            {done ? (
              <div className="border border-line bg-surface px-6 py-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  Sent
                </p>
                <h2 className="mt-3 font-display text-2xl text-petrol">
                  Thank you — we received your message
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                  The admissions team will respond using the contact details you
                  provided.
                </p>
                <div className="mt-8">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDone(false)}
                  >
                    Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="max-w-lg space-y-5" noValidate>
                {error ? (
                  <p
                    role="alert"
                    className="border border-line bg-surface px-3 py-2 text-sm text-petrol"
                  >
                    {error}
                  </p>
                ) : null}

                {/* Honeypot — leave empty */}
                <div className="absolute -left-[9999px] opacity-0" aria-hidden>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <Input
                  id="name"
                  label="Full name"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  error={fields.name}
                />
                <Input
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  error={fields.email}
                />
                <Input
                  id="phone"
                  label="Phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  error={fields.phone}
                  hint="Optional but helpful for admissions follow-up."
                />
                <Textarea
                  id="message"
                  label="Message"
                  name="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  error={fields.message}
                />

                <Button
                  type="submit"
                  variant="lime"
                  className="w-full justify-center sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>

          <aside className="space-y-6 self-start border border-line bg-surface p-5 lg:sticky lg:top-24">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Campus
              </p>
              <p className="mt-2 text-sm leading-relaxed text-petrol">
                {instituteContact.addressLines.join(", ")}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Phone
              </p>
              <ul className="mt-2 list-none space-y-1 p-0 text-sm text-petrol">
                {instituteContact.phones.map(
                  (p) => (
                    <li key={p}>
                      <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:underline">
                        {p}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Email
              </p>
              <a
                href={`mailto:${instituteContact.email}`}
                className="mt-2 block text-sm text-petrol hover:underline"
              >
                {instituteContact.email}
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
