// src/lib/api.ts
export const API_BASE = process.env.BACKEND_URL || "";

async function handleRes(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = contentType.includes("application/json") ? await res.json() : await res.text();
    throw new Error(typeof text === "string" ? text : JSON.stringify(text));
  }
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export async function get<T = any>(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  return handleRes(res) as Promise<T>;
}

export async function post<T = any>(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleRes(res) as Promise<T>;
}

export async function patch<T = any>(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleRes(res) as Promise<T>;
}

export async function del<T = any>(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleRes(res) as Promise<T>;
}

/* Types */
export type Client = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  image?: string;
};
