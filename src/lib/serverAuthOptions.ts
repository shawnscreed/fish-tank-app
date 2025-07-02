// File: src/lib/serverAuthOptions.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

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
          `SELECT * FROM "User" WHERE LOWER(email) = LOWER($1)`,
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Query user by email
        const result = await pool.query(
          `SELECT * FROM "User" WHERE email = $1`,
          [user.email]
        );

        let dbUser;
        if (result.rows.length === 0) {
          // User does not exist: create a new one!
          const insertResult = await pool.query(
            `INSERT INTO "User" (email, name, role) VALUES ($1, $2, $3) RETURNING *`,
            [user.email, user.name || (profile && profile.name) || "", "user"]
          );
          dbUser = insertResult.rows[0];
        } else {
          dbUser = result.rows[0];
        }

        // Attach full user info (including role) to the user object
        user.id = dbUser.id.toString();
        user.role = dbUser.role;
        user.name = dbUser.name ?? user.name;

        return true; // Allow login
      }
      // Allow login for other providers as usual
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
