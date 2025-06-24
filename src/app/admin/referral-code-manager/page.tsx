// 📄 Page: /admin/referral-code-manager

"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/app/ClientLayout";

type Role = "user" | "admin" | "super_admin" | "beta_tester";

interface ReferralCode {
  id: number;
  code: string;
  role: Role;
  created_at: string;
}

export default function AdminReferralCodeManagerPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editRole, setEditRole] = useState<Role>("user");

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/referral-code-manager");
      const json = await res.json();
      if (Array.isArray(json)) setCodes(json);
      else if (Array.isArray(json.codes)) setCodes(json.codes);
      else setCodes([]);
    } catch (err) {
      console.error("Failed to fetch referral codes:", err);
      setCodes([]);
    }
  };

  const addCode = async () => {
    if (!newCode.trim()) {
      setError("Referral code cannot be empty.");
      return;
    }

    const res = await fetch("/api/admin/referral-code-manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newCode, role: newRole }),
    });

    if (res.ok) {
      setNewCode("");
      setNewRole("user");
      setError("");
      fetchCodes();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to add code");
    }
  };

  const startEdit = (code: ReferralCode) => {
    setEditingId(code.id);
    setEditCode(code.code);
    setEditRole(code.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCode("");
    setEditRole("user");
  };

  const saveEdit = async () => {
    const res = await fetch(`/api/admin/referral-code-manager/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: editCode, role: editRole }),
    });

    if (res.ok) {
      cancelEdit();
      fetchCodes();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to update code");
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Referral Code Manager</h1>

        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Add New Code</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Referral Code"
              className="border rounded px-3 py-2"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="border rounded px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="beta_tester">Beta Tester</option>
            </select>
            <button
              onClick={addCode}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Code
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Code</th>
                <th className="p-3 border-b">Role</th>
                <th className="p-3 border-b">Created At</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-t">
                  <td className="p-3">
                    {editingId === code.id ? (
                      <input
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      <span className="font-mono">{code.code}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === code.id ? (
                      <select
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(e.target.value as Role)
                        }
                        className="border px-2 py-1 rounded"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="beta_tester">Beta Tester</option>
                      </select>
                    ) : (
                      <span className="capitalize">{code.role}</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(code.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 space-x-2">
                    {editingId === code.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(code)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClientLayout>
  );
}
