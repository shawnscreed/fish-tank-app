// File: src/lib/serverAuthOptions.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs"; // ✅ moved to top-level scope

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const result = await pool.query(
          `SELECT * FROM "User" WHERE email = $1`,
          [credentials.email]
        );

        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.name ?? undefined,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "",

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Check if user exists in DB by email
        const result = await pool.query(
          `SELECT * FROM "User" WHERE email = $1`,
          [user.email]
        );

        if (result.rows.length > 0) {
          // User exists, allow login
          return true;
        } else {
          // User not found, optionally create a new user or reject
          // For now allow sign in (but you might want to handle this differently)
          return true;
        }
      }
      // For other providers, allow sign in as usual
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.email = user.email;
        token.role = (user as any).role || "user";
        token.name = user.name ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = parseInt(token.id as string, 10);
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.name = token.name ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
