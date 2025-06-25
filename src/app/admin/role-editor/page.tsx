// 📄 Page: /admin/role-editor/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { JWTUser } from "@/lib/auth";

interface RoleAssignment {
  user_id: number;
  email: string;
  name?: string;
  role: string;
}

const roleOptions = [
  "user",
  "beta_user",
  "sub_admin",
  "admin",
  "super_admin",
];

export default function RoleEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const currentUser: JWTUser | null = useMemo(() => {
    if (!session?.user?.id || !session?.user?.email) return null;
    return {
      id: Number((session.user as any).id),
      email: session.user.email,
      name: session.user.name || "",
      role: (session.user as any).role,
    };
  }, [session]);

  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchRoles() {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/admin/role-editor");
        if (!res.ok) throw new Error("Failed to load roles");
        const data = await res.json();
        setRoles(data);
      } catch (err: any) {
        console.error("Error loading roles:", err);
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, [status]);

  const updateRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/role-editor/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      setRoles((prev) =>
        prev.map((r) =>
          r.user_id === userId ? { ...r, role: newRole } : r
        )
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role");
    }
  };

  if (status === "loading" || !currentUser) {
    return (
      <ClientLayoutWrapper user={currentUser || { id: 0, email: "", role: "user", name: "" }}>
        <div className="p-6 text-gray-500">Checking session...</div>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper user={currentUser}>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">👥 Role Editor</h1>

        {loading ? (
          <p className="text-gray-600">Loading roles...</p>
        ) : error ? (
          <p className="text-red-600 font-medium">Error: {error}</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-500 italic">No users found.</p>
        ) : (
          <div className="overflow-x-auto border rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border p-3">Name</th>
                  <th className="border p-3">Email</th>
                  <th className="border p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.user_id} className="hover:bg-gray-50">
                    <td className="border p-3">{r.name || "Unnamed"}</td>
                    <td className="border p-3 font-mono">{r.email}</td>
                    <td className="border p-3">
                      <select
                        value={r.role}
                        onChange={(e) => updateRole(r.user_id, e.target.value)}
                        className="border px-2 py-1 rounded"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
