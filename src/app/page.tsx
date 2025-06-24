import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getUserFromCookies();

  // 🔐 Redirect to login if no user is found
  if (!user) {
    redirect("/login");
  }

  // ✅ Otherwise show the dashboard
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to FishTank Manager 🐠</h1>
      <p className="text-gray-700">Use the sidebar to view and manage your tanks and fish.</p>
    </div>
  );
}
