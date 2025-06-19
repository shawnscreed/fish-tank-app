"use client";
import ClientLayout from "./ClientLayout";

export default function HomePage() {
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome to FishTank Manager 🐠</h1>
      <p className="text-gray-700">Use the sidebar to view and manage your tanks and fish.</p>
    </ClientLayout>
  );
}
