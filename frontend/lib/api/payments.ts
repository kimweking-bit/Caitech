import { apiFetch } from "@/lib/api/client";
import type {
  Cart,
  CheckoutPayload,
  Order,
  PaginatedResponse,
  PaymentInitiation,
  PaymentMethod,
} from "@/types/api";

export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>("/payments/cart/", { auth: true, cache: "no-store" });
}

export async function addToCart(courseId: number): Promise<Cart> {
  return apiFetch<Cart>("/payments/cart/", {
    method: "POST",
    body: JSON.stringify({ course_id: courseId }),
    auth: true,
  });
}

export async function removeFromCart(courseId: number): Promise<Cart> {
  return apiFetch<Cart>(`/payments/cart/items/${courseId}/`, {
    method: "DELETE",
    auth: true,
  });
}

export async function applyCoupon(coupon_code: string): Promise<Cart> {
  return apiFetch<Cart>("/payments/cart/coupon/", {
    method: "POST",
    body: JSON.stringify({ coupon_code }),
    auth: true,
  });
}

export async function checkoutCart(payload: CheckoutPayload): Promise<Order> {
  return apiFetch<Order>("/payments/cart/checkout/", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function listOrders(): Promise<Order[]> {
  const data = await apiFetch<PaginatedResponse<Order> | Order[]>(
    "/payments/orders/",
    { auth: true, cache: "no-store" },
  );
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function getOrder(reference: string): Promise<Order> {
  return apiFetch<Order>(
    `/payments/orders/${encodeURIComponent(reference)}/`,
    { auth: true, cache: "no-store" },
  );
}

export async function getOrderStatus(reference: string): Promise<Order> {
  return apiFetch<Order>(
    `/payments/orders/${encodeURIComponent(reference)}/status/`,
    { auth: true, cache: "no-store" },
  );
}

export async function initiatePayment(
  reference: string,
  method: PaymentMethod,
  phone_number?: string,
): Promise<PaymentInitiation> {
  return apiFetch<PaymentInitiation>(
    `/payments/orders/${encodeURIComponent(reference)}/initiate/`,
    {
      method: "POST",
      body: JSON.stringify({
        method,
        ...(phone_number ? { phone_number } : {}),
      }),
      auth: true,
    },
  );
}
