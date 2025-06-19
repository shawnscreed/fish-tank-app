"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";

// ✅ Updated Plant type
interface Plant {
  id: number;
  name: string;
  light_level?: string;
  co2_required?: boolean;
  temperature_range?: string;
}

// ✅ Reused for fish, corals, inverts
interface Entry {
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

type Fish = Entry;
type Invert = Entry;
type Coral = Entry;

function singularize(type: string) {
  if (type === "fish") return "fish";
  if (type === "plant") return "plant";
  if (type === "corals") return "coral";
  if (type === "inverts") return "invert";
  return type;
}

export default function WorkDetailPage() {
  const { id } = useParams();
  const [tank, setTank] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("fish");
  const [entryList, setEntryList] = useState<any[]>([]);
  const [assignedEntries, setAssignedEntries] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");

  // Category-specific states (for future use if needed)
  const [assignedFish, setAssignedFish] = useState<Fish[]>([]);
  const [assignedPlant, setAssignedPlant] = useState<Plant[]>([]);
  const [assignedInverts, setAssignedInverts] = useState<Invert[]>([]);
  const [assignedCorals, setAssignedCorals] = useState<Coral[]>([]);

  useEffect(() => {
    fetch(`/api/work/${id}`).then(res => res.json()).then(setTank);
    fetch(`/api/${selectedType}`).then(res => res.json()).then(setEntryList);
    fetch(`/api/work/${id}/${selectedType}`).then(res => res.json()).then(setAssignedEntries);

    fetch(`/api/work/${id}/fish`).then(res => res.json()).then(setAssignedFish);
    fetch(`/api/work/${id}/plant`).then(res => res.json()).then(setAssignedPlant);
    fetch(`/api/work/${id}/inverts`).then(res => res.json()).then(setAssignedInverts);
    fetch(`/api/work/${id}/corals`).then(res => res.json()).then(setAssignedCorals);
  }, [id, selectedType]);

  const assignItem = async () => {
    const res = await fetch(`/api/tank${selectedType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tank_id: id,
        plant_id: selectedId, // ✅ must match what API expects
      }),
    });

    if (res.ok) {
      alert(`${selectedType} added to tank!`);
      setSelectedId("");
      fetch(`/api/work/${id}/${selectedType}`)
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setAssignedEntries(data) : setAssignedEntries([]))
        .catch(() => setAssignedEntries([]));
    } else {
      alert(`Failed to assign ${selectedType}`);
    }
  };

  if (!tank) {
    return <ClientLayout><div className="p-6">Loading...</div></ClientLayout>;
  }

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Tank #{id} Details</h1>
        <p><strong>Water Type:</strong> {tank.water_type}</p>
        <p><strong>Gallons:</strong> {tank.gallons}</p>

        {/* Type Selector */}
        <div className="my-4">
          <label className="font-semibold">Select Type to Assign: </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border p-1 ml-2"
          >
            <option value="fish">Fish</option>
            <option value="plant">Plants</option>
            <option value="corals">Corals</option>
            <option value="inverts">Inverts</option>
          </select>
        </div>

        {/* Assign item */}
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

        {/* Table View */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Assigned {selectedType}</h3>

          {(() => {
            const entriesToRender =
              selectedType === "inverts"
                ? assignedInverts
                : selectedType === "plant"
                ? assignedPlant
                : selectedType === "corals"
                ? assignedCorals
                : assignedFish;

            return entriesToRender.length === 0 ? (
              <p>No {selectedType} assigned yet.</p>
            ) : (
              <table className="table-auto border-collapse w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Name</th>
                    {selectedType === "plant" ? (
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
                  </tr>
                </thead>
                <tbody>
                  {entriesToRender.map((entry, index) => (
                    <tr key={`${selectedType}-${entry.id}-${index}`}>
                      <td className="border px-2 py-1">{entry.name}</td>
                      {selectedType !== "plant" && (
  <>
    <td className="border px-2 py-1">{(entry as Entry).ph_low ?? "?"}–{(entry as Entry).ph_high ?? "?"}</td>
    <td className="border px-2 py-1">{(entry as Entry).hardness_low ?? "?"}–{(entry as Entry).hardness_high ?? "?"}</td>
    <td className="border px-2 py-1">{(entry as Entry).temp_low ?? "?"}–{(entry as Entry).temp_high ?? "?"}</td>
    <td className="border px-2 py-1">{(entry as Entry).aggressiveness || "N/A"}</td>
  </>
)}

                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </ClientLayout>
  );
}
