"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spin } from "antd";
import { useRouter } from "next/navigation";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin />
      </div>
    );
  }
}
