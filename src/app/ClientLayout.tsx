"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface MenuItem {
  name: string;
  href: string;
}

interface ClientLayoutProps {
  children: ReactNode;
  user?: {
    id: number;
    email: string;
    role: "user" | "admin" | "super_admin";
    name?: string;
  } | null;
}

export default function ClientLayout({ children, user }: ClientLayoutProps) {
  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/" },
    { name: "Fish", href: "/fish" },
    { name: "Plant", href: "/plant" },
    { name: "Coral", href: "/coral" },
    { name: "Inverts", href: "/inverts" },
    { name: "Tank", href: "/tank" },
    { name: "Work", href: "/work" },
    { name: "Chemicals", href: "/chemicals" },
    { name: "Testpage2", href: "/testpage2" },
  ];

  const adminItems: MenuItem[] =
    user?.role === "admin" || user?.role === "super_admin"
      ? [
          { name: "Referral Codes", href: "/admin/referral-code-manager" },
          { name: "Feedback Entries", href: "/admin/feedback-entry-viewer" },
          { name: "Role Editor", href: "/admin/role-editor" },
          { name: "User Accounts", href: "/admin/user-account-manager" },
        ]
      : [];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-blue-600 hover:underline">
                  {item.name}
                </Link>
              </li>
            ))}
            {adminItems.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">Admin Tools</li>
                {adminItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-purple-600 hover:underline">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          {user ? (
            <div>
              Logged in as:
              <br />
              <span className="font-semibold">{user.name || user.email}</span>
              <br />
              Role: <span className="capitalize">{user.role}</span>
              <form action="/logout" method="POST" className="mt-2">
                <button className="text-red-600 hover:underline">Logout</button>
              </form>
            </div>
          ) : (
            <div className="text-red-600">Not logged in</div>
          )}
        </div>
      </aside>
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
