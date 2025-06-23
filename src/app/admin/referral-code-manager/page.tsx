"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const res = await fetch("/api/admin/referral-code-manager");
    const json = await res.json();
    setCodes(json);
  };

  const addCode = async () => {
    if (!newCode) {
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

  return (
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
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id} className="border-t">
                <td className="p-3 font-mono">{code.code}</td>
                <td className="p-3 capitalize">{code.role}</td>
                <td className="p-3 text-gray-500">
                  {new Date(code.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
