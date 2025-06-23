"use client";

import { useEffect, useState } from "react";

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

export default function InvertsTableClient() {
  const [invertsList, setInvertsList] = useState<Inverts[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Inverts>>({
    new: {} as Inverts,
  });

  const fetchInverts = async () => {
    const res = await fetch("/api/inverts");
    const data = await res.json();
    if (Array.isArray(data)) {
      setInvertsList(data);
    }
  };

  useEffect(() => {
    fetchInverts();
  }, []);

  const handleChange = (id: number | "new", field: keyof Inverts, value: any) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: number | "new") => {
    const invert = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/inverts" : `/api/inverts/${id}`;
    const body = id === "new" ? { ...invert, in_use: true } : invert;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchInverts();
      setEditing((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return { ...newState, new: {} as Inverts };
      });
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this invert?");
    if (!confirmed) return;

    const res = await fetch(`/api/inverts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_use: false }),
    });

    if (res.ok) {
      await fetchInverts();
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Inverts Table</h1>
      <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field} className="border px-2 py-1 text-left">
                {field}
              </th>
            ))}
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invertsList.map((invert) => (
            <tr key={invert.id}>
              {fields.map((field) => (
                <td key={field} className="border px-2 py-1">
                  {field === "water_type" || field === "aggressiveness" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={editing[invert.id!]?.[field] ?? invert[field] ?? ""}
                      onChange={(e) => handleChange(invert.id!, field, e.target.value)}
                    >
                      {field === "water_type" ? (
                        <>
                          <option value="">Select type</option>
                          <option value="fresh">Fresh</option>
                          <option value="salt">Salt</option>
                          <option value="brackish">Brackish</option>
                        </>
                      ) : (
                        <>
                          <option value="">Select</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      className="w-full border px-1 py-1"
                      value={(editing[invert.id!]?.[field] ?? invert[field] ?? "").toString()}
                      onChange={(e) => handleChange(invert.id!, field, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="border px-2 py-1 flex gap-2">
                <button
                  onClick={() => handleSave(invert.id!)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(invert.id!)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* New Entry Row */}
          <tr>
            {fields.map((field) => (
              <td key={field} className="border px-2 py-1">
                {field === "water_type" || field === "aggressiveness" ? (
                  <select
                    className="w-full border px-1 py-1"
                    value={editing["new"]?.[field] ?? ""}
                    onChange={(e) => handleChange("new", field, e.target.value)}
                  >
                    {field === "water_type" ? (
                      <>
                        <option value="">Select type</option>
                        <option value="fresh">Fresh</option>
                        <option value="salt">Salt</option>
                        <option value="brackish">Brackish</option>
                      </>
                    ) : (
                      <>
                        <option value="">Select</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    className="w-full border px-1 py-1"
                    value={(editing["new"]?.[field] ?? "").toString()}
                    onChange={(e) => handleChange("new", field, e.target.value)}
                  />
                )}
              </td>
            ))}
            <td className="border px-2 py-1">
              <button
                onClick={() => handleSave("new")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
