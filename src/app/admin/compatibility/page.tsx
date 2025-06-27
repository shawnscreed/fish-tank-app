"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

interface Rule {
  id: number;
  species1_id: number;
  species2_id: number;
  compatible: boolean;
  reason: string | null;
}

export default function AdminCompatibilityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newRule, setNewRule] = useState({
    species1_id: "",
    species2_id: "",
    compatible: true,
    reason: "",
  });

  /* ───────────────────────── Auth Guards ───────────────────────── */
  if (status === "loading") return <div className="p-6">Checking session…</div>;
  if (!session?.user || !["admin", "super_admin"].includes((session.user as any).role)) {
    // Redirect non‑admins to home/login
    router.push("/login");
    return null;
  }

  const user = {
    id: Number((session.user as any).id),
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as any).role,
  };

  /* ───────────────────────── Initial Fetch ─────────────────────── */
  useEffect(() => {
    fetch("/api/admin/compatibility")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return setError(data.error);
        setRules(data);
      })
      .catch(() => setError("Failed to load rules"))
      .finally(() => setLoading(false));
  }, []);

  /* ───────────────────────── CRUD helpers ──────────────────────── */
  const handleAdd = async () => {
    const res = await fetch("/api/admin/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        species1_id: Number(newRule.species1_id),
        species2_id: Number(newRule.species2_id),
        compatible: newRule.compatible,
        reason: newRule.reason || null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setRules((prev) => [...prev, data]);
      setNewRule({ species1_id: "", species2_id: "", compatible: true, reason: "" });
    } else alert(data.error);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this rule?")) return;
    const res = await fetch(`/api/admin/compatibility/${id}`, { method: "DELETE" });
    if (res.ok) setRules((prev) => prev.filter((r) => r.id !== id));
  };

  /* ───────────────────────── Render ────────────────────────────── */
  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Species Compatibility Rules</h1>

        {/* Add new rule */}
        <div className="mb-6 border p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Add New Rule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Species 1 ID"
              className="border p-2"
              value={newRule.species1_id}
              onChange={(e) => setNewRule({ ...newRule, species1_id: e.target.value })}
            />
            <input
              type="number"
              placeholder="Species 2 ID"
              className="border p-2"
              value={newRule.species2_id}
              onChange={(e) => setNewRule({ ...newRule, species2_id: e.target.value })}
            />
            <select
              className="border p-2"
              value={newRule.compatible ? "true" : "false"}
              onChange={(e) => setNewRule({ ...newRule, compatible: e.target.value === "true" })}
            >
              <option value="true">Compatible</option>
              <option value="false">Incompatible</option>
            </select>
            <input
              type="text"
              placeholder="Reason (optional)"
              className="border p-2"
              value={newRule.reason}
              onChange={(e) => setNewRule({ ...newRule, reason: e.target.value })}
            />
          </div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
            Add Rule
          </button>
        </div>

        {/* Existing rules */}
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto border rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Species 1</th>
                  <th className="border p-2">Species 2</th>
                  <th className="border p-2">Compat</th>
                  <th className="border p-2">Reason</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="border p-2">{r.id}</td>
                    <td className="border p-2">{r.species1_id}</td>
                    <td className="border p-2">{r.species2_id}</td>
                    <td className="border p-2 text-center">{r.compatible ? "✅" : "❌"}</td>
                    <td className="border p-2">{r.reason ?? "—"}</td>
                    <td className="border p-2 text-center">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
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
