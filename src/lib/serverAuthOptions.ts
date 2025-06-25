// File: src/lib/serverAuthOptions.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

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
          `SELECT * FROM "User" WHERE email = $1 AND password_hash = crypt($2, password_hash)`,
          [credentials.email, credentials.password]
        );
        if (result.rows.length > 0) {
          const user = result.rows[0];
          return {
            id: user.id.toString(),
            name: user.name ?? undefined,
            email: user.email,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "",

  callbacks: {
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
