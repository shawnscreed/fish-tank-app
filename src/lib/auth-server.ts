// 📄 src/lib/auth-server.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./serverAuthOptions";
import { NextRequest } from "next/server";

// For edge/server handlers where you have the request
export async function getUserFromRequest(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

// ✅ Add this for handlers without `req`, like route.ts pages
export async function getUserFromServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  return {
    id: Number((session.user as any).id),
    email: session.user.email!,
    name: session.user.name || "",
    role: (session.user as any).role || "user",
  };
}
