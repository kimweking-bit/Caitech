/** Money / media helpers for catalogue (API values only). */

export function formatMoney(
  amount: string | null | undefined,
  currency = "KES",
): string | null {
  if (amount == null || amount === "") return null;
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("en-KE")}`;
  }
}

export function mediaUrl(
  src: string | null | undefined,
  apiBase?: string,
): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  const base = (apiBase || process.env.NEXT_PUBLIC_API_URL || "")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "");
  if (!base) return src;
  return src.startsWith("/") ? `${base}${src}` : `${base}/${src}`;
}
