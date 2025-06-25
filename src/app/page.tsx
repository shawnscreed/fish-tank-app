// 📄 File: src/app/page.tsx

import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { JWTUser } from "@/lib/auth";

export default async function HomePage() {
  const user: JWTUser | null = await getUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to FishTank Manager 🐠</h1>
        <p className="text-gray-700">
          Use the sidebar to view and manage your tanks, fish, and more.
        </p>
      </div>
    </ClientLayoutWrapper>
  );
}
