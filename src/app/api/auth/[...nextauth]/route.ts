// File: src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions"; // ✅ Safe to use server-side only


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
