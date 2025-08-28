// src/components/AuthGuard.tsx
"use client";
import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spin, Result } from "antd";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
  requiredRoles,
}: {
  children: ReactNode;
  requiredRoles?: string[];
}) {
  const { status, data } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const role = (data?.user as any)?.role;
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    return <Result status="403" title="403" subTitle="You do not have access to this resource." />;
  }

  return <>{children}</>;
}
