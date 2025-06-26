// File: src/lib/next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name?: string;
      role?: string;
    };
  }

  interface User {
    id: number;
    email: string;
    name?: string;
    role?: string;
  }
}
