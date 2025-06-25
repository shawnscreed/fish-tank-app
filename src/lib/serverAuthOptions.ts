// File: src/lib/serverAuthOptions.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const result = await pool.query(
            `SELECT * FROM "User" WHERE email = $1 AND password_hash = crypt($2, password_hash)`,
            [credentials.email, credentials.password]
          );
          if (result.rows.length > 0) {
            const user = result.rows[0];
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        } catch (err) {
          console.error("❌ Login error:", err);
        }
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const result = await pool.query(
            `SELECT * FROM "User" WHERE email = $1`,
            [user.email]
          );
          if (result.rows.length === 0) {
            console.warn("❌ Google login rejected – no user found:", user.email);
            return false;
          }
        } catch (err) {
          console.error("❌ Google sign-in DB check failed:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user && "id" in user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role || "user";
      }

      if (token.email && !token.role) {
        try {
          const result = await pool.query(
            `SELECT id, role FROM "User" WHERE email = $1`,
            [token.email]
          );
          if (result.rows.length > 0) {
            token.id = result.rows[0].id;
            token.role = result.rows[0].role || "user";
          }
        } catch (err) {
          console.error("❌ Role fetch failed:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
