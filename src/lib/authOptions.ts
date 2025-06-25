// File: src/lib/authOptions.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    // ✅ Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Manual Credentials Provider
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
          console.error("Login error:", err);
        }

        return null;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Attach ID from manual login
      if (user && "id" in user) {
        token.id = user.id;
      }

      // Always fetch role from database using token.email
      if (token?.email) {
        try {
          const result = await pool.query(
            `SELECT id, role FROM "User" WHERE email = $1`,
            [token.email]
          );

          const dbUser = result.rows[0];
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          } else {
            token.role = "user"; // fallback
          }
        } catch (err) {
          console.error("Failed to fetch role from DB:", err);
          token.role = "user"; // fallback
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
