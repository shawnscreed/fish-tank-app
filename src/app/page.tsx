// 📄 src/app/page.tsx
export const dynamic = "force-dynamic"; // Needed for server-side sessions

import { getUserFromServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default async function HomePage() {
  // getUserFromServer() returns JWTUser | null
  const user = await getUserFromServer();

  // 🔐 If the session is missing, send the visitor to /login
  if (!user) {
    redirect("/login");
  }

  // After the guard above, `user` is guaranteed to be JWTUser
  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to FishTank Manager 🐠
        </h1>
        <p className="text-gray-700">
          Use the sidebar to view and manage your tanks, fish, and more.
        </p>
      </div>
    </ClientLayoutWrapper>
  );
}
