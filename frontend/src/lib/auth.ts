// src/lib/auth.ts
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import type { Role } from "./rbac";

export async function getSessionServer(req?: Request) {
  // server-side token retrieval (middleware/pages)
  const token = await getToken({ req: (req as any) ?? undefined, secret: process.env.NEXTAUTH_SECRET });
  return token;
}

export function withRole(sessionUser: any, requiredRoles: Role[] = []) {
  if (!sessionUser) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const role = sessionUser.role;
  return requiredRoles.includes(role);
}

/**
 * authorize utility for client usage
 */
export async function authorizeClient(requiredRoles: Role[] = []) {
  // rely on next-auth getSession (client-side)
  const session = await getSession();
  if (!session?.user) return false;
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes((session.user as any).role);
}
