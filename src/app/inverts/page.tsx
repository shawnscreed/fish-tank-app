"use client";
import { useEffect, useState } from "react";
import ClientLayout from "../ClientLayout";

type Inverts = {
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

export default function InvertsPage() {
  const [InvertsList, setInvertsList] = useState<Inverts[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Inverts>>({} as Record<number | "new", Inverts>);

  useEffect(() => {
    async function fetchInverts() {
      try {
        const res = await fetch("/api/inverts");
        const data = await res.json();
        if (Array.isArray(data)) {
          setInvertsList(data);
        } else {
          console.error("Invalid Inverts list format", data);
        }
      } catch (err) {
        console.error("Failed to fetch Inverts list", err);
      }
    }

    fetchInverts();
  }, []);

  const handleChange = (id: number | "new", field: keyof Inverts, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = async (id: number | "new") => {
    const Inverts = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/inverts" : `/api/inverts/${id}`;
    const body = id === "new"
      ? { ...Inverts, in_use: true }
      : Inverts;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const refreshed = await fetch("/api/inverts");
      const data = await refreshed.json();
      if (Array.isArray(data)) {
        setInvertsList(data);
      } else {
        console.error("Expected array but got:", data);
        setInvertsList([]);
      }
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

const handleDelete = async (id: number) => {
  const res = await fetch(`/api/inverts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ in_use: false }),
  });

  if (res.ok) {
    const updated = await fetch("/api/inverts").then((r) => r.json());
    setInvertsList(updated); // or setPlantList, depending on your component name
  } else {
    console.error("Failed to delete item");
  }
};


  const fields: (keyof Inverts)[] = [
    "name", "water_type",
    "ph_low", "ph_high",
    "hardness_low", "hardness_high",
    "temp_low", "temp_high",
    "aggressiveness"
  ];

  return (
    <ClientLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Inverts Table</h1>
        <table className="w-full table-auto border-collapse border border-gray-300 rounded shadow-sm text-sm">
          <thead>
            <tr>
              {fields.map(field => (
                <th key={field} className="border px-2 py-1 text-left">{field}</th>
              ))}
              <th className="border border-gray-300 px-2 py-1 bg-gray-100 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {InvertsList.map(Inverts => (
              <tr key={Inverts.id} className="hover:bg-blue-50 transition-colors">
                {fields.map(field => (
                  <td key={field} className="border px-2 py-1">
                    {field === "water_type" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={editing[Inverts.id!]?.[field] ?? Inverts[field] ?? ""}
                        onChange={(e) => handleChange(Inverts.id!, field, e.target.value)}
                      >
                        <option value="">Select type</option>
                        <option value="fresh">Fresh</option>
                        <option value="salt">Salt</option>
                        <option value="brackish">Brackish</option>
                      </select>
                    ) : field === "aggressiveness" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={editing[Inverts.id!]?.[field] ?? Inverts[field] ?? ""}
                        onChange={(e) => handleChange(Inverts.id!, field, e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : field === "in_use" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={(editing[Inverts.id!]?.[field] ?? Inverts[field] ?? true).toString()}
                        onChange={(e) => handleChange(Inverts.id!, field, e.target.value === "true")}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        className="w-full border px-1 py-1"
                        value={editing[Inverts.id!]?.[field] ?? Inverts[field] ?? ""}
                        onChange={(e) => handleChange(Inverts.id!, field, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleSave(Inverts.id!)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDelete(Inverts.id!)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            <tr>
              {fields.map(field => (
                <td key={field} className="border px-2 py-1">
                  {field === "water_type" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={editing["new"]?.[field] ?? ""}
                      onChange={(e) => handleChange("new", field, e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option value="fresh">Fresh</option>
                      <option value="salt">Salt</option>
                      <option value="brackish">Brackish</option>
                    </select>
                  ) : field === "aggressiveness" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={editing["new"]?.[field] ?? ""}
                      onChange={(e) => handleChange("new", field, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : field === "in_use" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={(editing["new"]?.[field] ?? true).toString()}
                      onChange={(e) => handleChange("new", field, e.target.value === "true")}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      className="w-full border px-1 py-1"
                      value={editing["new"]?.[field] ?? ""}
                      onChange={(e) => handleChange("new", field, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleSave("new")}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ClientLayout>
  );
}
