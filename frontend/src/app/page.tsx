"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/rbac";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const role = session?.user?.role as Role | undefined;

      const roleRedirects: Record<Role, string> = {
        admin: "/dashboard",
        lawyer: "/cases",
        reviewer: "/documents",
        staff: "/appointments",
        client: "/appointments",
      };

      const redirectTo =
        role && roleRedirects[role] ? roleRedirects[role] : "/dashboard";
      router.push(redirectTo);
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin />
      </div>
    );
  }

  return null;
}
