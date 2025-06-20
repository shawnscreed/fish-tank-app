"use client";
import { useEffect, useState } from "react";
import ClientLayout from "../ClientLayout";

type Fish = {
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

export default function FishPage() {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Fish>>({} as Record<number | "new", Fish>);

  const fetchFish = async () => {
    try {
      const res = await fetch("/api/fish");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFishList(data);
      } else {
        console.error("Invalid fish list format", data);
      }
    } catch (err) {
      console.error("Failed to fetch fish list", err);
    }
  };

  useEffect(() => {
    fetchFish();
  }, []);

  const handleChange = (id: number | "new", field: keyof Fish, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = async (id: number | "new") => {
    const fish = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/fish" : `/api/fish/${id}`;
    const body = id === "new"
      ? { ...fish, in_use: true }
      : fish;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchFish();
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

const handleDelete = async (id: number) => {
  const res = await fetch(`/api/fish/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    await fetchFish(); // refresh list
  } else {
    console.error("Failed to delete fish:", await res.text());
  }
};


  const fields: (keyof Fish)[] = [
    "name", "water_type",
    "ph_low", "ph_high",
    "hardness_low", "hardness_high",
    "temp_low", "temp_high",
    "aggressiveness"
  ];

  return (
    <ClientLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Fish Table</h1>
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
            {fishList.map(fish => (
              <tr key={fish.id} className="hover:bg-blue-50 transition-colors">
                {fields.map(field => (
                  <td key={field} className="border px-2 py-1">
                    {field === "water_type" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={editing[fish.id!]?.[field] ?? fish[field] ?? ""}
                        onChange={(e) => handleChange(fish.id!, field, e.target.value)}
                      >
                        <option value="">Select type</option>
                        <option value="fresh">Fresh</option>
                        <option value="salt">Salt</option>
                        <option value="brackish">Brackish</option>
                      </select>
                    ) : field === "aggressiveness" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={editing[fish.id!]?.[field] ?? fish[field] ?? ""}
                        onChange={(e) => handleChange(fish.id!, field, e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <input
                        className="w-full border px-1 py-1"
                        value={String(editing[fish.id!]?.[field] ?? fish[field] ?? "")}
                        onChange={(e) => handleChange(fish.id!, field, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleSave(fish.id!)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDelete(fish.id!)}
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
