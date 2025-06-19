"use client";
import { useEffect, useState } from "react";
import ClientLayout from "../ClientLayout";

type Tank = {
  id?: number;
  name?: string;
  water_type?: string;
  gallons?: number;
  in_use?: boolean;
};

export default function TankPage() {
  const [TankList, setTankList] = useState<Tank[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Tank>>({} as Record<number | "new", Tank>);

  useEffect(() => {
    async function fetchTank() {
      try {
        const res = await fetch("/api/tank");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTankList(data);
        } else {
          console.error("Invalid Tank list format", data);
        }
      } catch (err) {
        console.error("Failed to fetch Tank list", err);
      }
    }

    fetchTank();
  }, []);

  const handleChange = (id: number | "new", field: keyof Tank, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = async (id: number | "new") => {
    const Tank = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/tank" : `/api/tank/${id}`;
    const body = id === "new"
      ? { ...Tank, in_use: true }
      : Tank;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const refreshed = await fetch("/api/tank");
      const data = await refreshed.json();
      if (Array.isArray(data)) {
        setTankList(data);
      } else {
        console.error("Expected array but got:", data);
        setTankList([]);
      }
      setEditing(prev => {
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

  if (res.ok) {
    const updated = await fetch("/api/tank").then((r) => r.json());
    setTankList(updated); // or setPlantList, depending on your component name
  } else {
    console.error("Failed to delete item");
  }
};


  const fields: (keyof Tank)[] = [
    'name', 'water_type', 'gallons', 'in_use'
  ];

  return (
    <ClientLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Tank Table</h1>
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
            {TankList.map(Tank => (
              <tr key={Tank.id} className="hover:bg-blue-50 transition-colors">
                {fields.map(field => (
                  <td key={field} className="border px-2 py-1">
                    {field === "water_type" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={editing[Tank.id!]?.[field] ?? Tank[field] ?? ""}
                        onChange={(e) => handleChange(Tank.id!, field, e.target.value)}
                      >
                        <option value="">Select type</option>
                        <option value="fresh">Fresh</option>
                        <option value="salt">Salt</option>
                        <option value="brackish">Brackish</option>
                      </select>
                    ) 
                    : field === "in_use" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={(editing[Tank.id!]?.[field] ?? Tank[field] ?? true).toString()}
                        onChange={(e) => handleChange(Tank.id!, field, e.target.value === "true")}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        className="w-full border px-1 py-1"
                        value={editing[Tank.id!]?.[field] ?? Tank[field] ?? ""}
                        onChange={(e) => handleChange(Tank.id!, field, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleSave(Tank.id!)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDelete(Tank.id!)}
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
                  )                     
                   : field === "in_use" ? (
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
