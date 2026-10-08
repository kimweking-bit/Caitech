"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  applyCoupon,
  getCart,
  removeFromCart,
} from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { formatMoney, mediaUrl } from "@/lib/utils/format";
import type { Cart } from "@/types/api";

function CartView() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const c = await getCart();
      setCart(c);
      setCoupon(c.coupon_code || "");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRemove(courseId: number) {
    setBusy(true);
    setMsg(null);
    try {
      const c = await removeFromCart(courseId);
      setCart(c);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not remove item.");
    } finally {
      setBusy(false);
    }
  }

  async function onCoupon(e: FormEvent) {
    e.preventDefault();
    if (!coupon.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const c = await applyCoupon(coupon.trim());
      setCart(c);
      setMsg(c.coupon_code ? `Coupon ${c.coupon_code} applied.` : "Coupon updated.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Invalid coupon.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Loading cart…
        </p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-16 text-center">
        <p className="text-sm text-petrol">{error}</p>
        <div className="mt-6">
          <Button type="button" variant="secondary" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  const empty = !cart || cart.items.length === 0;
  const currency = cart?.currency || "KES";

  return (
    <Container className="py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Commerce
      </p>
      <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">Cart</h1>

      {msg ? (
        <p className="mt-4 text-sm text-ink-muted" role="status">
          {msg}
        </p>
      ) : null}

      {empty ? (
        <div className="mt-10 border border-line bg-surface px-6 py-14 text-center">
          <p className="font-display text-xl text-petrol">Your cart is empty</p>
          <p className="mt-2 text-sm text-ink-muted">
            Browse programmes and add one when you are ready to enrol.
          </p>
          <div className="mt-8">
            <Button href="/courses" variant="lime">
              Browse courses
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <ul className="list-none space-y-0 border border-line p-0">
            {cart!.items.map((item) => {
              const img = mediaUrl(item.image);
              return (
                <li
                  key={item.course_id}
                  className="flex flex-col gap-4 border-b border-line p-4 last:border-b-0 sm:flex-row sm:items-center"
                >
                  <div className="relative h-20 w-full shrink-0 overflow-hidden bg-petrol/5 sm:w-28">
                    {img ? (
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/courses/${item.slug}`}
                      className="font-display text-lg text-petrol no-underline hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-ink-muted">
                      {formatMoney(item.unit_price, item.currency || currency)}
                      {item.original_price ? (
                        <span className="ml-2 line-through opacity-70">
                          {formatMoney(
                            item.original_price,
                            item.currency || currency,
                          )}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onRemove(item.course_id)}
                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:text-petrol disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="space-y-6 self-start border border-line bg-surface p-5 lg:sticky lg:top-24">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Summary
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="text-petrol">
                    {formatMoney(cart!.subtotal, currency)}
                  </dd>
                </div>
                {Number(cart!.discount_amount) > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Discount</dt>
                    <dd className="text-petrol">
                      −{formatMoney(cart!.discount_amount, currency)}
                    </dd>
                  </div>
                ) : null}
                {Number(cart!.fee_amount) > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Fees</dt>
                    <dd className="text-petrol">
                      {formatMoney(cart!.fee_amount, currency)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-medium">
                  <dt className="text-petrol">Total</dt>
                  <dd className="text-petrol">
                    {formatMoney(cart!.total, currency)}
                  </dd>
                </div>
              </dl>
            </div>

            <form onSubmit={onCoupon} className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    id="coupon"
                    label="Coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={busy}
                    placeholder="Code"
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={busy}>
                  Apply
                </Button>
              </div>
            </form>

            <Button
              href="/checkout"
              variant="lime"
              className="w-full justify-center"
            >
              Checkout
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
}

export default function CartPage() {
  return (
    <RequireAuth>
      <CartView />
    </RequireAuth>
  );
}
