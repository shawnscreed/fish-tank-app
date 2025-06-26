// 📄 File: src/app/coral/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "../../components/ClientLayoutWrapper";

type Coral = {
  id?: number;
  name?: string;
  water_type?: string;
  ph_low?: number;
  ph_high?: number;
  hardness_low?: number;
  hardness_high?: number;
  temp_low?: number;
  temp_high?: number;
  in_use?: boolean;
  aggressiveness?: string;
};

export default function CoralPage() {
  const { data: session, status } = useSession();
  const [corals, setCorals] = useState<Coral[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Coral>>({} as any);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/coral")
        .then((res) => res.json())
        .then((data) => Array.isArray(data) ? setCorals(data) : []);
    }
  }, [status]);

  const handleChange = (id: number | "new", field: keyof Coral, value: any) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number | "new") => {
    const coral = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/coral" : `/api/coral/${id}`;
    const body = id === "new" ? { ...coral, in_use: true } : coral;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const refreshed = await fetch("/api/coral").then((r) => r.json());
      setCorals(refreshed);
      const updated = { ...editing };
      delete updated[id];
      setEditing(updated);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/coral/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_use: false }),
    });

    if (res.ok) {
      const refreshed = await fetch("/api/coral").then((r) => r.json());
      setCorals(refreshed);
    }
  };

  const fields: (keyof Coral)[] = [
    "name", "water_type", "ph_low", "ph_high",
    "hardness_low", "hardness_high", "temp_low", "temp_high",
    "aggressiveness",
  ];

  if (status === "loading") return <div className="p-6">Loading...</div>;

  const user = session?.user
    ? {
        id: Number((session.user as any).id),
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as any).role,
      }
    : null;

  if (!user) return <div className="p-6">Unauthorized</div>;

  if (user.role !== "admin" && user.role !== "super_admin") {
    return <div className="p-6 text-red-600">Access denied: Admins only</div>;
  }

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Coral Table</h1>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field} className="border px-2 py-1 text-left">{field}</th>
              ))}
              <th className="border px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {corals.map((coral) => (
              <tr key={coral.id} className="hover:bg-blue-50">
                {fields.map((field) => (
                  <td key={field} className="border px-2 py-1">
                    {field === "water_type" || field === "aggressiveness" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={String(editing[coral.id!]?.[field] ?? coral[field] ?? "")}
                        onChange={(e) => handleChange(coral.id!, field, e.target.value)}
                      >
                        <option value="">Select</option>
                        {field === "water_type" && ["fresh", "salt", "brackish"].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        {field === "aggressiveness" && ["low", "medium", "high"].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full border px-1 py-1"
                        value={String(editing[coral.id!]?.[field] ?? coral[field] ?? "")}
                        onChange={(e) => handleChange(coral.id!, field, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 flex gap-2">
                  <button onClick={() => handleSave(coral.id!)} className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                  <button onClick={() => handleDelete(coral.id!)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}

            {/* New Row */}
            <tr>
              {fields.map((field) => (
                <td key={field} className="border px-2 py-1">
                  {field === "water_type" || field === "aggressiveness" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={String(editing["new"]?.[field] ?? "")}
                      onChange={(e) => handleChange("new", field, e.target.value)}
                    >
                      <option value="">Select</option>
                      {field === "water_type" && ["fresh", "salt", "brackish"].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      {field === "aggressiveness" && ["low", "medium", "high"].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full border px-1 py-1"
                      value={String(editing["new"]?.[field] ?? "")}
                      onChange={(e) => handleChange("new", field, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="border px-2 py-1">
                <button onClick={() => handleSave("new")} className="bg-green-600 text-white px-2 py-1 rounded">Add</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ClientLayoutWrapper>
  );
}
