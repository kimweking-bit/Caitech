"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { checkoutCart, getCart } from "@/lib/api/payments";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { formatMoney } from "@/lib/utils/format";
import type { Cart } from "@/types/api";

function CheckoutView() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      const n = [user.first_name, user.last_name].filter(Boolean).join(" ");
      setName(n || user.username);
      setEmail(user.email || "");
      setPhone(user.phone_number || "");
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await getCart();
        if (!cancelled) {
          setCart(c);
          if (!c.items.length) {
            setError("Your cart is empty.");
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Could not load cart.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSubmitting(true);
    try {
      const order = await checkoutCart({
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
      });
      router.push(`/orders/${order.reference}`);
    } catch (err) {
      setFields(fieldErrors(err));
      setError(
        err instanceof ApiError ? err.message : "Checkout failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Preparing checkout…
        </p>
      </Container>
    );
  }

  const currency = cart?.currency || "KES";

  return (
    <Container className="py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Commerce
      </p>
      <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">
        Checkout
      </h1>

      {error && !cart?.items.length ? (
        <div className="mt-10 border border-line px-6 py-10 text-center">
          <p className="text-sm text-petrol">{error}</p>
          <div className="mt-6">
            <Button href="/courses" variant="lime">
              Browse courses
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
          <form onSubmit={onSubmit} className="max-w-lg space-y-5">
            {error ? (
              <p role="alert" className="text-sm text-petrol">
                {error}
              </p>
            ) : null}

            <Input
              id="customer_name"
              label="Full name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              error={fields.customer_name}
            />

            <Input
              id="customer_email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              error={fields.customer_email}
            />

            <Input
              id="customer_phone"
              label="Phone (M-Pesa)"
              type="tel"
              autoComplete="tel"
              required
              placeholder="2547…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
              error={fields.customer_phone}
              hint="Kenyan mobile in international format for M-Pesa."
            />

            <Button
              type="submit"
              variant="lime"
              className="w-full justify-center sm:w-auto"
              disabled={submitting || !cart?.items.length}
            >
              {submitting ? "Creating order…" : "Place order"}
            </Button>
          </form>

          <aside className="border border-line bg-surface p-5 self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Order total
            </p>
            <p className="mt-3 font-display text-2xl text-petrol">
              {formatMoney(cart?.total || "0", currency)}
            </p>
            <ul className="mt-4 list-none space-y-2 p-0 text-sm text-ink-muted">
              {cart?.items.map((i) => (
                <li key={i.course_id} className="flex justify-between gap-2">
                  <span className="truncate">{i.title}</span>
                  <span className="shrink-0">
                    {formatMoney(i.unit_price, i.currency || currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-muted">
              You will choose M-Pesa, card, or PayPal on the next step.
            </p>
          </aside>
        </div>
      )}
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutView />
    </RequireAuth>
  );
}
