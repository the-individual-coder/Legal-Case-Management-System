import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("jwt callback", { token, account, profile })
      try {
        // Run sync on first login (account is defined) OR always if you want fresh role each time
        if (token?.email) {
          const backend =
            (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "").replace(/\/+$/, "");

            const res = await fetch(`${backend}/user/syncUser`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: token.email,
                name: token.name || token?.name,
                image: token.picture,      // renamed from avatar → image
                providerId: token.sub || token.id, // Google account ID
              }),
            });
            
          if (res.ok) {

            const data: any = (await res.json()).data;
            token.id = data.id ?? token.sub;
            token.role = data.role ?? "client";
            token.permissions = data.permissions ?? [];
          } else {
            console.error("Sync failed:", await res.text());
            token.role = token.role ?? "client";
            token.permissions = token.permissions ?? [];
          }
        }
      } catch (e) {
        console.error("Error in jwt callback:", e);
        token.role = token.role ?? "client";
        token.permissions = token.permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
        console.log("=== SESSION CALLBACK ===", { session, token });
      if (token) {
        session.user = session.user ?? ({} as any);
        (session.user as any).id = (token as any).id ?? (token as any).sub;
        (session.user as any).role = (token as any).role ?? "client";
        (session.user as any).permissions = (token as any).permissions ?? [];
        (session.user as any).image =
          (token as any).picture ?? session.user?.image;
      }
      return session;
    },
  },
};

export default authOptions;
