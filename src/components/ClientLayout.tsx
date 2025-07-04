// 📄 File: src/components/ClientLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { JWTUser } from "@/lib/auth";
import UserStatus from "@/components/UserStatus";
import { usePathname } from "next/navigation";
import MobileSidebar from "@/components/MobileSidebar";

interface ClientLayoutProps {
  user: JWTUser;
  children: ReactNode;
}

interface MenuItem {
  name: string;
  href: string;
}

export default function ClientLayout({ children, user }: ClientLayoutProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Compatibility", href: "/dashboard/compatibility" },
     { name: "Wishlist", href: "/dashboard/wishlist" },
{ name: "Stocking Suggestions", href: "/dashboard/stocking-suggestions" },
     { name: "Development Roadmap", href: "/dashboard/roadmap" },
    { name: "Feedback", href: "/dashboard/feedback" },
  ];

  const adminPages: MenuItem[] =
    user.role === "admin" || user.role === "super_admin"
      ? [
         
        { name: "Fish", href: "/fish" },
          { name: "Plant", href: "/plant" },
          { name: "Inverts", href: "/inverts" },
          { name: "Coral", href: "/coral" },
          { name: "Tank", href: "/tank" },
          { name: "Chemicals", href: "/chemicals" },
        ]
      : [];

  const adminTools: MenuItem[] =
    user.role === "admin" || user.role === "super_admin"
      ? [
          { name: "Access Control", href: "/admin/access-control" },
          { name: "User Accounts", href: "/admin/user-account-manager" },
          { name: "Role Editor", href: "/admin/role-editor" },
          { name: "Referral Codes", href: "/admin/referral-code-manager" },
          { name: "Feedback Entries", href: "/admin/feedback-entry-viewer" },
          { name: "Compatibility", href: "/admin/compatibility" },
        ]
      : [];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex min-h-screen relative">
      <MobileSidebar user={user} /> {/* 📱 Mobile Menu */}

      {/* 💻 Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-gray-100 p-4 border-r flex flex-col justify-between overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${
                    isActive(item.href) ? "font-bold text-black" : "text-blue-600"
                  } hover:underline`}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {adminPages.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">
                  Admin Pages
                </li>
                {adminPages.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${
                        isActive(item.href) ? "font-bold text-black" : "text-blue-700"
                      } hover:underline`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}

            {adminTools.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">
                  Admin Tools
                </li>
                {adminTools.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${
                        isActive(item.href) ? "font-bold text-black" : "text-purple-700"
                      } hover:underline`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <UserStatus />
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                signOut({ callbackUrl: `${window.location.origin}/login` });
              }
            }}
            className="mt-2 text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
