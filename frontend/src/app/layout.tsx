// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { MainLayout } from "@/layouts/MainLayout";

export const metadata: Metadata = {
  title: "D&S Law — Legal Case Management",
  description: "Legal Case Management System",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
