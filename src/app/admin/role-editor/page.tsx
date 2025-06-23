"use client";

import { useEffect, useState } from "react";

type Role = "user" | "admin" | "super_admin" | "beta_tester";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export default function AdminRoleEditorPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingRoles, setEditingRoles] = useState<Record<number, Role>>({});

  useEffect(() => {
    fetch("/api/admin/role-editor")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleRoleChange = (userId: number, newRole: Role) => {
    setEditingRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  const saveRole = async (userId: number) => {
    const newRole = editingRoles[userId];
    if (!newRole) return;

    const res = await fetch("/api/admin/role-editor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      const updated = { ...editingRoles };
      delete updated[userId];
      setEditingRoles(updated);
    } else {
      console.error("Failed to update role");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Role Editor</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const currentRole = editingRoles[user.id] ?? user.role;
              return (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <select
                      value={currentRole}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as Role)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="beta_tester">Beta Tester</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => saveRole(user.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
