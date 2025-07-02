// 📄 Page: /dashboard/roadmap

"use client";

import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import type { JWTUser, Role } from "@/lib/auth";

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading user...</p>;
  if (!session || !session.user) return <p>Unauthorized</p>;

  const user: JWTUser = {
    id: Number((session.user as any).id),
    email: session.user.email || "",
    name: session.user.name || undefined,
    role: (session.user as any).role as Role,
  };

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center">🐟 Fish Keeper App Roadmap</h1>
          <p className="text-center text-gray-600">
            This is where we're heading — here's what we're building for you!
          </p>

          {/* ---------------- MVP ---------------- */}
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-2">✅ Phase 1: MVP Essentials</h2>
            <ul className="list-disc ml-6 text-gray-800 space-y-1">
              <li>✅ User Registration with Referral Code</li>
              <li>✅ Login System (Email + Google OAuth)</li>
              <li>✅ Dashboard Page + Custom Sidebar</li>
              <li>✅ Tank Naming + Tank List/Details</li>
              <li>✅ Add & View Fish in Tank</li>
              <li>✅ Water Parameters + Alerts</li>
              <li>✅ Feedback Form + Viewer</li>
              <li>✅ Placeholder Paid Feature Logic</li>
              <li>✅ Developer/Admin Tools</li>
              <li>✅ Deployment Online</li>
              <li>✅ Data Privacy (User-level isolation)</li>
            </ul>
          </section>

          {/* ---------------- PHASE 2 ---------------- */}
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-2">⚙️ Phase 2: Polishing & Expansion (In Progress)</h2>
            <ul className="list-disc ml-6 text-gray-800 space-y-1">
              <li>✅ Plant & Invert assignment fixes</li>
              <li>✅ Saltwater & Brackish tank support</li>
              <li>✅ Coral support</li>
              <li>✅ Google OAuth fix</li>
              <li>✅ WishList</li>
              <li>✅ 🧠 Stocking Suggestions</li>
             <li>✅ 🔍 Compatibility Checker- needs more data on back end.</li>
              <li>✅ 🏷 QR Tank Labels</li>
              <li>✅ 🧾 Water Test Logging & Timeline</li>
              <li>✅ 🖊️ Maintenance Logs</li>
              <li>✅ ✉️ Contact/Feedback Viewer (Admin)</li>
              <li>✅ 🦫 Referral Role Editor (Admin)</li>
              <li>✅ 🧱 Access Level Controls</li>
              <li>✅ 📃 Roadmap Page (this page)</li>
            </ul>
          </section>

          {/* ---------------- PAID ---------------- */}
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-2">💼 Phase 3: Paid Features</h2>
            <ul className="list-disc ml-6 text-gray-800 space-y-1">
              <li>✅ Multiple tanks per user</li>
              <li>✅ Maintenance Reminders</li>
              <li>✅ Advanced Timeline filtering</li>
              <li>✅ Water Parameter Alert Notifications</li>
              <li>✅ Premium Stocking Suggestions</li>
              <li>✅ Referral-based Role Levels</li>
              
            </ul>
          </section>

          {/* ---------------- BUSINESS ---------------- */}
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-2">🧰 Phase 4: Business Features</h2>
            <ul className="list-disc ml-6 text-gray-800 space-y-1">
              <li>Client Management (name, contact, notes)</li>
              <li>Scheduling & Routing System</li>
              <li>Technician Accounts</li>
              <li>Service Log with Photos</li>
              <li>Printable Tank Reports</li>
              <li>Inventory Tracking</li>
              <li>Billing & Invoicing</li>
              <li>Client Portal (logs, payments, requests)</li>
              <li>QR Labels for Service Tanks</li>
              <li>Voice-to-Text Logging (mobile)</li>
              <li>Offline Mode (mobile)</li>
              <li>Client Satisfaction Tracking</li>
               <li>🖰 Printable Reports</li>
               <li>Subscription Management</li>
              <li>📸 Photo Journal for tanks</li>
            </ul>
          </section>

          {/* ---------------- IDEAS ---------------- */}
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-2">💡 Long Term Ideas</h2>
            <ul className="list-disc ml-6 text-gray-800 space-y-1">
              <li>AI Assistant</li>
              <li>Knowledge Hub / Learning Section</li>
              <li>Camera-Based Test Strip Reader</li>
              <li>Shared/Public Tanks</li>
              <li>Expense Tracker</li>
              <li>Product Suggestion Store</li>
              <li>Emergency Troubleshooter Tool</li>
              <li>Smart Setup Wizard</li>
              <li>Push Notifications</li>
              <li>Backup/Restore System</li>
            </ul>
          </section>

          <p className="text-center text-gray-500 mt-12">
            Thanks for following our journey! 💙
          </p>
        </div>
      </MainContainer>
    </ClientLayoutWrapper>
  );
}