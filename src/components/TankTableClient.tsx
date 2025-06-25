"use client";

import { useEffect, useState } from "react";

type Tank = {
  id?: number;
  name?: string;
  water_type?: string;
  gallons?: number;
  in_use?: boolean;
};

export default function TankTableClient() {
  const [tankList, setTankList] = useState<Tank[]>([]);
  const [editing, setEditing] = useState<Partial<Record<number | "new", Tank>>>({});


  const fetchTanks = async () => {
    try {
      const res = await fetch("/api/tank");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTankList(data);
      } else {
        console.error("Invalid tank list:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, []);

  const handleChange = (id: number | "new", field: keyof Tank, value: any) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number | "new") => {
    const tank = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/tank" : `/api/tank/${id}`;
    const body = id === "new" ? { ...tank, in_use: true } : tank;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchTanks();
      setEditing((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/tank/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_use: false }),
    });

    if (res.ok) fetchTanks();
  };

  const fields: (keyof Tank)[] = ["name", "water_type", "gallons", "in_use"];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tank Table</h1>
      <table className="w-full table-auto border-collapse border border-gray-300 rounded shadow-sm text-sm">
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
          {tankList.map((tank) => (
            <tr key={tank.id}>
              {fields.map((field) => (
                <td key={field} className="border px-2 py-1">
                  {field === "water_type" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={editing[tank.id!]?.[field] ?? tank[field] ?? ""}
                      onChange={(e) => handleChange(tank.id!, field, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="fresh">Fresh</option>
                      <option value="salt">Salt</option>
                      <option value="brackish">Brackish</option>
                    </select>
                  ) : field === "in_use" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={(editing[tank.id!]?.[field] ?? tank[field] ?? true).toString()}
                      onChange={(e) => handleChange(tank.id!, field, e.target.value === "true")}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      className="w-full border px-1 py-1"
                      value={editing[tank.id!]?.[field] ?? tank[field] ?? ""}
                      onChange={(e) => handleChange(tank.id!, field, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleSave(tank.id!)}
                  className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(tank.id!)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {/* New Row */}
          <tr>
            {fields.map((field) => (
              <td key={field} className="border px-2 py-1">
                {field === "water_type" ? (
                  <select
                    className="w-full border px-1 py-1"
                    value={editing["new"]?.[field] ?? ""}
                    onChange={(e) => handleChange("new", field, e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="fresh">Fresh</option>
                    <option value="salt">Salt</option>
                    <option value="brackish">Brackish</option>
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
  );
}
