"use client";
import { useEffect, useState } from "react";
import ClientLayout from "../ClientLayout";

type Plant = {
  id?: number;
  name?: string;
  light_level?: string;
  co2_required?: boolean;
  temperature_range?: string;
};

export default function PlantsPage() {
  const [PlantsList, setPlantsList] = useState<Plant[]>([]);
  const [editing, setEditing] = useState<Record<number | "new", Plant>>({} as Record<number | "new", Plant>);

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await fetch("/api/plant");
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlantsList(data);
        } else {
          console.error("Invalid Plants list format", data);
        }
      } catch (err) {
        console.error("Failed to fetch Plants list", err);
      }
    }

    fetchPlants();
  }, []);

  const handleChange = (id: number | "new", field: keyof Plant, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
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
      const refreshed = await fetch("/api/plant");
      const data = await refreshed.json();
      if (Array.isArray(data)) {
        setPlantsList(data);
      } else {
        console.error("Expected array but got:", data);
        setPlantsList([]);
      }
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };







  
  // ✅ Handle deleting a plant
  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this plant?");
    if (!confirmed) return;

    const res = await fetch(`/api/plant/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPlantsList(prev => prev.filter((plant) => plant.id !== id));
    } else {
      console.error("Failed to delete plant", await res.text());
    }
  };

  const fields: (keyof Plant)[] = [
    "name", "light_level", "co2_required", "temperature_range"
  ];

  return (
    <ClientLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Plants Table</h1>
        <table className="w-full table-auto border-collapse border border-gray-300 rounded shadow-sm text-sm">
          <thead>
            <tr>
              {fields.map(field => (
                <th key={field} className="border px-2 py-1 text-left">{field}</th>
              ))}
              <th className="border px-2 py-1 bg-gray-100 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PlantsList.map(plant => (
              <tr key={plant.id} className="hover:bg-blue-50 transition-colors">
                {fields.map(field => (
                  <td key={field} className="border px-2 py-1">
                    {field === "co2_required" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={(editing[plant.id!]?.[field] ?? plant[field] ?? false).toString()}
                        onChange={(e) => handleChange(plant.id!, field, e.target.value === "true")}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        className="w-full border px-1 py-1"
                        value={editing[plant.id!]?.[field] ?? plant[field] ?? ""}
                        onChange={(e) => handleChange(plant.id!, field, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleSave(plant.id!)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
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

            <tr>
              {fields.map(field => (
                <td key={field} className="border px-2 py-1">
                  {field === "co2_required" ? (
                    <select
                      className="w-full border px-1 py-1"
                      value={(editing["new"]?.[field] ?? false).toString()}
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
