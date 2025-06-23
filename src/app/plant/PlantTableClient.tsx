"use client";

import { useEffect, useState } from "react";

type Plant = {
  id?: number;
  name?: string;
  light_level?: string;
  co2_required?: boolean;
  temperature_range?: string;
};

export default function PlantTableClient() {
  const [plantList, setPlantList] = useState<Plant[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Plant>>({
    new: {} as Plant,
  });

  const fetchPlants = async () => {
    const res = await fetch("/api/plant");
    const data = await res.json();
    if (Array.isArray(data)) setPlantList(data);
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handleChange = (id: number | "new", field: keyof Plant, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSave = async (id: number | "new") => {
    const plant = editing[id];
    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/plant" : `/api/plant/${id}`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plant),
    });

    if (res.ok) {
      await fetchPlants();
      setEditing((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return { ...newState, new: {} as Plant };
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plant?")) return;
    const res = await fetch(`/api/plant/${id}`, { method: "DELETE" });
    if (res.ok) fetchPlants();
  };

  const fields: (keyof Plant)[] = [
    "name",
    "light_level",
    "co2_required",
    "temperature_range",
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Plant Table</h1>
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
          {plantList.map((plant) => (
            <tr key={plant.id}>
              {fields.map((field) => (
                <td key={field} className="border px-2 py-1">
                  {field === "co2_required" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={(editing[plant.id!]?.[field] ?? plant[field] ?? false).toString()}
                      onChange={(e) =>
                        handleChange(plant.id!, field, e.target.value === "true")
                      }
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      className="w-full border px-1 py-1"
                      value={editing[plant.id!]?.[field] ?? plant[field] ?? ""}
                      onChange={(e) =>
                        handleChange(plant.id!, field, e.target.value)
                      }
                    />
                  )}
                </td>
              ))}
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleSave(plant.id!)}
                  className="bg-blue-600 text-white px-2 py-1 rounded mr-1"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(plant.id!)}
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
                {field === "co2_required" ? (
                  <select
                    className="w-full border px-1 py-1"
                    value={(editing["new"]?.[field] ?? false).toString()}
                    onChange={(e) =>
                      handleChange("new", field, e.target.value === "true")
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    className="w-full border px-1 py-1"
                    value={editing["new"]?.[field] ?? ""}
                    onChange={(e) =>
                      handleChange("new", field, e.target.value)
                    }
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
