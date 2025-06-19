"use client";

// Page: app/work/[id]/page.tsx - Displays and manages a tank's assigned fish, plants, inverts, and coral.
// This is the main component for rendering tank details and allowing users to assign/remove fish, plants, inverts, and corals.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";

// Represents a plant entry with additional metadata
interface Plant {
  id: number;
  name: string;
  light_level?: string;
  co2_required?: boolean;
  temperature_range?: string;
}

// Common structure for items from join tables (e.g., TankFish, TankCoral)
interface AssignedEntry {
  tank_entry_id: number; // Unique row ID in join table
  id: number;
  name: string;
  ph_low?: number;
  ph_high?: number;
  hardness_low?: number;
  hardness_high?: number;
  temp_low?: number;
  temp_high?: number;
  aggressiveness?: string;
}

// Aliases for assigned types
type Fish = AssignedEntry;
type Invert = AssignedEntry;
type Coral = AssignedEntry;

// Converts selectedType to singular form used in API route naming
function singularize(type: string) {
  if (type === "fish") return "fish";
  if (type === "plant") return "plant";
  if (type === "coral") return "coral";
  if (type === "inverts") return "invert";
  return type;
}

export default function WorkDetailPage() {
  const { id } = useParams(); // Tank ID from dynamic route
  const [tank, setTank] = useState<any>(null); // Tank details object
  const [selectedType, setSelectedType] = useState("fish"); // Dropdown type selector
  const [entryList, setEntryList] = useState<any[]>([]); // Available assignable entries
  const [selectedId, setSelectedId] = useState(""); // Selected ID to assign

  // All assigned entries by type
  const [assignedFish, setAssignedFish] = useState<Fish[]>([]);
  const [assignedPlant, setAssignedPlant] = useState<Plant[]>([]);
  const [assignedInverts, setAssignedInverts] = useState<Invert[]>([]);
  const [assignedCoral, setAssignedCoral] = useState<Coral[]>([]);

  // Fetch assigned fish/plants/inverts/corals for this tank
  const loadAssigned = async () => {
    const [fish, plant, inverts, coral] = await Promise.all([
      fetch(`/api/work/${id}/fish`).then(res => res.json()),
      fetch(`/api/work/${id}/plant`).then(res => res.json()),
      fetch(`/api/work/${id}/inverts`).then(res => res.json()),
      fetch(`/api/work/${id}/coral`).then(res => res.json()),
    ]);

    setAssignedFish(fish);
    setAssignedPlant(plant);
    setAssignedInverts(inverts);
    setAssignedCoral(coral);
  };

  // Deletes entry from tank using its join table row ID (tank_entry_id)
  const handleDelete = async (type: string, entryId: number) => {
    const res = await fetch(`/api/work/${id}/${type}/${entryId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert(`${type} removed from tank`);
      await loadAssigned();
    } else {
      alert(`Failed to delete ${type}`);
    }
  };

  // Assigns a new entry (by ID) to the tank
  const assignItem = async () => {
    if (!selectedId) return;

    const res = await fetch(`/api/work/${id}`, {
      method: "POST",
      body: JSON.stringify({
        type: selectedType,
        entryId: selectedId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      alert(`${selectedType} added to tank!`);
      setSelectedId("");
      await loadAssigned();
    } else {
      alert(`Failed to assign ${selectedType}`);
    }
  };

  // Fetch tank details and available entries on page load or type switch
  useEffect(() => {
    fetch(`/api/work/${id}`).then(res => res.json()).then(setTank);
    fetch(`/api/${selectedType}`).then(res => res.json()).then(setEntryList);
    loadAssigned();
  }, [id, selectedType]);

  if (!tank) {
    return <ClientLayout><div className="p-6">Loading...</div></ClientLayout>;
  }

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Tank #{id} Details</h1>
        <p><strong>Water Type:</strong> {tank.water_type}</p>
        <p><strong>Gallons:</strong> {tank.gallons}</p>

        {/* Assignment UI */}
        <div className="my-4">
          <label className="font-semibold">Select Type to Assign: </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border p-1 ml-2"
          >
            <option value="fish">Fish</option>
            <option value="plant">Plants</option>
            <option value="coral">Coral</option>
            <option value="inverts">Inverts</option>
          </select>
        </div>

        <div className="bg-gray-100 border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">Add {selectedType}</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border p-1 mr-2"
          >
            <option value="">Select {selectedType}</option>
            {entryList.map(entry => (
              <option key={entry.id} value={entry.id}>{entry.name}</option>
            ))}
          </select>
          <button
            onClick={assignItem}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Assign
          </button>
        </div>

        {/* Display assigned items by category */}
        <div className="mt-6 space-y-8">
          {[{ type: "fish", label: "Fish", entries: assignedFish },
            { type: "inverts", label: "Inverts", entries: assignedInverts },
            { type: "plant", label: "Plants", entries: assignedPlant },
            { type: "coral", label: "Coral", entries: assignedCoral },
          ].map(({ type, label, entries }) => (
            <div key={type}>
              <h3 className="font-semibold mb-2">Assigned {label}</h3>
              {entries.length === 0 ? (
                <p>No {label.toLowerCase()} assigned yet.</p>
              ) : (
                <table className="table-auto border-collapse w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Name</th>
                      {type === "plant" ? (
                        <>
                          <th className="border px-2 py-1">Light Level</th>
                          <th className="border px-2 py-1">CO₂</th>
                          <th className="border px-2 py-1">Temp Range</th>
                        </>
                      ) : (
                        <>
                          <th className="border px-2 py-1">pH</th>
                          <th className="border px-2 py-1">Hardness</th>
                          <th className="border px-2 py-1">Temp</th>
                          <th className="border px-2 py-1">Aggression</th>
                        </>
                      )}
                      <th className="border px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr key={`${type}-${entry.id}-${index}`}>
                        <td className="border px-2 py-1">{entry.name}</td>
                        {type === "plant" ? (
                          (() => {
                            const plant = entry as Plant;
                            return (
                              <>
                                <td className="border px-2 py-1">{plant.light_level || "N/A"}</td>
                                <td className="border px-2 py-1">{plant.co2_required ? "Yes" : "No"}</td>
                                <td className="border px-2 py-1">{plant.temperature_range || "?"}</td>
                                <td className="border px-2 py-1 text-center">
                                  <button
                                    onClick={() => handleDelete(type, (plant as any).tank_entry_id)}

                                    className="text-red-600 hover:underline text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </>
                            );
                          })()
                        ) : (
                          (() => {
                            const item = entry as AssignedEntry;
                            return (
                              <>
                                <td className="border px-2 py-1">{item.ph_low ?? "?"}–{item.ph_high ?? "?"}</td>
                                <td className="border px-2 py-1">{item.hardness_low ?? "?"}–{item.hardness_high ?? "?"}</td>
                                <td className="border px-2 py-1">{item.temp_low ?? "?"}–{item.temp_high ?? "?"}</td>
                                <td className="border px-2 py-1">{item.aggressiveness || "N/A"}</td>
                                <td className="border px-2 py-1 text-center">
                                  <button
                                    onClick={() => handleDelete(type, item.tank_entry_id)}
                                    className="text-red-600 hover:underline text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </>
                            );
                          })()
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
