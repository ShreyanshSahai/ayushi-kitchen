import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      // Allow all users with Google accounts to sign in
      // Admin check happens in session callback
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isAdmin = ADMIN_EMAILS.includes(
          user.email?.toLowerCase() ?? "",
        );
        session.user.mobile = user.mobile ?? "";
        session.user.lastLoggedIn = user.lastLoggedIn?.toISOString();
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoggedIn: new Date() },
      });
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/sign-in",
  },
};

declare module "next-auth" {
  interface Session {
    user?: {
      id: number;
      name?: string | null;
      email?: string | null;
      isAdmin: boolean;
      mobile: string;
      lastLoggedIn?: string;
    };
  }

  interface User {
    id: number;
    mobile: string;
    lastLoggedIn: Date | null;
  }
}

