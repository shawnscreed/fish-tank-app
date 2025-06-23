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
   role: "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";
    name?: string;
  } | null;
}

export default function ClientLayout({ children, user }: ClientLayoutProps) {
  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Coral", href: "/coral" },
    { name: "Tank", href: "/tank" },
    { name: "Work", href: "/work" },
    { name: "Chemicals", href: "/chemicals" },
      { name: "Feedback", href: "/dashboard/feedback" },

  ];

  const adminPages: MenuItem[] =
    user?.role === "admin" || user?.role === "super_admin"
      ? [
          { name: "Fish", href: "/fish" },
          { name: "Plant", href: "/plant" },
          { name: "Inverts", href: "/inverts" },
        ]
      : [];

  const adminTools: MenuItem[] =
    user?.role === "admin" || user?.role === "super_admin"
      ? [
          { name: "User Accounts", href: "/admin/user-account-manager" },
          { name: "Role Editor", href: "/admin/role-editor" },
          { name: "Referral Codes", href: "/admin/referral-code-manager" },
          { name: "Feedback Entries", href: "/admin/feedback-entry-viewer" },
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

            {adminPages.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">Admin Pages</li>
                {adminPages.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-blue-700 hover:underline">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}

            {adminTools.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">Admin Tools</li>
                {adminTools.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-purple-700 hover:underline">
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
