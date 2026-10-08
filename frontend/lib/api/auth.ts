import { apiFetch } from "@/lib/api/client";
import type { AuthTokens, AuthUser, RegisterPayload } from "@/types/api";

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export async function loginUser(
  username: string,
  password: string,
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    auth: false,
  });
}

export async function refreshAccessToken(refresh: string): Promise<{ access: string }> {
  return apiFetch<{ access: string }>("/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
    auth: false,
  });
}

export async function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me/", { auth: true });
}

export async function updateMe(
  data: Partial<
    Pick<AuthUser, "first_name" | "last_name" | "email" | "phone_number" | "bio">
  >,
): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>("/auth/password/reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
    auth: false,
  });
}

export async function confirmPasswordReset(payload: {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>("/auth/password/reset/confirm/", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}
