// src/app/login/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // Just provide SessionProvider, no sidebar/header
  return <SessionProvider>{children}</SessionProvider>;
}
