// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

// Extend the default session interface
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the 'id' field
      role: string; // Add the 'role' field
      permissions: string[]; // Add the 'permissions' field
      name: string | null;
      email: string | null;
      image: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string; // Add 'id' to the JWT token
    role: string;
    permissions: string[];
  }
}
