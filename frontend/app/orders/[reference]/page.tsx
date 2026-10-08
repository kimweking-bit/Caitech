"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getOrder,
  getOrderStatus,
  initiatePayment,
} from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/utils/format";
import type { Order, PaymentMethod } from "@/types/api";

const PENDING = new Set(["pending", "initiated", "processing", "awaiting_payment"]);
const SUCCESS = new Set(["paid", "success", "succeeded", "completed"]);
const FAILED = new Set(["failed", "cancelled", "canceled", "expired"]);

function norm(s: string | undefined | null) {
  return (s || "").toLowerCase();
}

function OrderView() {
  const params = useParams();
  const reference = String(params.reference || "");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollCount.current = 0;
  }, []);

  const load = useCallback(async () => {
    try {
      const o = await getOrder(reference);
      setOrder(o);
      setError(null);
      return o;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load order.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    void load();
    return () => stopPoll();
  }, [load, stopPoll]);

  const startPoll = useCallback(() => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      pollCount.current += 1;
      if (pollCount.current > 40) {
        stopPoll();
        setInfo("Still waiting for confirmation. Refresh this page shortly.");
        return;
      }
      try {
        const o = await getOrderStatus(reference);
        setOrder(o);
        const st = norm(o.status);
        const tx = norm(o.latest_transaction?.status);
        if (SUCCESS.has(st) || SUCCESS.has(tx)) {
          stopPoll();
          setInfo("Payment confirmed. Enrolment will appear on your account.");
        } else if (FAILED.has(st) || FAILED.has(tx)) {
          stopPoll();
          setInfo("Payment did not complete. You can try again below.");
        }
      } catch {
        /* keep polling briefly */
      }
    }, 4000);
  }, [reference, stopPoll]);

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInfo(null);
    try {
      const init = await initiatePayment(
        reference,
        method,
        method === "mpesa" ? phone.trim() : undefined,
      );
      if (init.redirect_url) {
        window.location.href = init.redirect_url;
        return;
      }
      setInfo(
        init.message ||
          (method === "mpesa"
            ? "Check your phone for the M-Pesa prompt."
            : "Payment initiated."),
      );
      const o = await load();
      if (o && (PENDING.has(norm(o.status)) || PENDING.has(norm(o.latest_transaction?.status)))) {
        startPoll();
      }
    } catch (err) {
      setInfo(err instanceof ApiError ? err.message : "Payment initiation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Loading order…
        </p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-16 text-center">
        <p className="text-sm text-petrol">{error || "Order not found."}</p>
        <div className="mt-6">
          <Button href="/account/orders" variant="secondary">
            Your orders
          </Button>
        </div>
      </Container>
    );
  }

  const st = norm(order.status);
  const tx = norm(order.latest_transaction?.status);
  const isSuccess = SUCCESS.has(st) || SUCCESS.has(tx);
  const isFailed = FAILED.has(st) || FAILED.has(tx);
  const isPending = !isSuccess && !isFailed;

  return (
    <Container className="py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Order
      </p>
      <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">
        {order.reference}
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
        Status · {order.status}
        {order.latest_transaction
          ? ` · payment ${order.latest_transaction.status}`
          : ""}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="border border-line">
            <ul className="list-none divide-y divide-line p-0">
              {order.items.map((item, i) => (
                <li
                  key={`${item.course_title}-${i}`}
                  className="flex justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="text-petrol">{item.course_title}</span>
                  <span className="shrink-0 text-ink-muted">
                    {formatMoney(item.unit_price, item.currency || order.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-line px-4 py-3 text-base font-medium text-petrol">
              <span>Total</span>
              <span>{formatMoney(order.total, order.currency)}</span>
            </div>
          </div>

          {info ? (
            <p className="text-sm text-ink-muted" role="status">
              {info}
            </p>
          ) : null}

          {isSuccess ? (
            <div className="border border-line bg-surface px-5 py-6">
              <p className="font-display text-xl text-petrol">Payment successful</p>
              <p className="mt-2 text-sm text-ink-muted">
                Your enrolment is handled by the backend after payment
                confirmation. Programme access appears once processing
                completes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/courses" variant="lime">
                  Browse programmes
                </Button>
                <Button href="/account/orders" variant="secondary">
                  Order history
                </Button>
              </div>
            </div>
          ) : null}

          {isFailed ? (
            <div className="border border-line px-5 py-6">
              <p className="font-display text-xl text-petrol">Payment not completed</p>
              <p className="mt-2 text-sm text-ink-muted">
                You can retry payment below or contact admissions if funds were
                deducted.
              </p>
            </div>
          ) : null}

          {isPending ? (
            <form onSubmit={onPay} className="max-w-md space-y-5 border border-line p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Pay now
              </p>

              <fieldset className="space-y-2">
                <legend className="sr-only">Payment method</legend>
                {(
                  [
                    ["mpesa", "M-Pesa"],
                    ["card", "Card"],
                    ["paypal", "PayPal"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-petrol"
                  >
                    <input
                      type="radio"
                      name="method"
                      value={value}
                      checked={method === value}
                      onChange={() => setMethod(value)}
                      disabled={busy}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>

              {method === "mpesa" ? (
                <Input
                  id="mpesa-phone"
                  label="M-Pesa phone"
                  type="tel"
                  required
                  placeholder="2547…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                />
              ) : (
                <p className="text-xs text-ink-muted">
                  You will be redirected to the payment provider to complete
                  checkout securely.
                </p>
              )}

              <Button
                type="submit"
                variant="lime"
                className="w-full justify-center"
                disabled={busy}
              >
                {busy ? "Starting payment…" : "Pay"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-center"
                onClick={() => void load()}
              >
                Refresh status
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

export default function OrderPage() {
  return (
    <RequireAuth>
      <OrderView />
    </RequireAuth>
  );
}
