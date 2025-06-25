import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      role: string;
      email: string;
      name?: string;
    };
  }

  interface User extends DefaultUser {
    id: number;
    role: string;
    email: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string; // ✅ fix: use string
    role: string;
    email: string;
    name?: string;
  }
}

export {}; // ✅ Ensures this file is treated as a module
