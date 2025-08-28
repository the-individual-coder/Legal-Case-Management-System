"use client";

import { signIn } from "next-auth/react";
import { Button, Card, Typography } from "antd";
import Image from "next/image";

const { Title } = Typography;

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0F172A]">
      <Card className="w-96 p-8 text-center bg-[#1E293B]">
        <Image src="/logo.png" alt="D&S Law" width={80} height={80} className="mx-auto mb-4" />
        <Title level={3} className="text-white mb-6">D&S Law Portal</Title>
        <Button
          type="primary"
          size="large"
          className="w-full"
          onClick={() => signIn('google',{ callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </Button>
      </Card>
    </div>
  );
}
