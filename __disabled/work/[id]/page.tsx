

// Page: app/work/[id]/page.tsx - Displays and manages a tank's assigned fish, plants, inverts, coral, and includes water test logging link.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromClientCookies, JWTUser } from "@/lib/auth";

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
  tank_entry_id: number;
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

// Represents a water test result
interface WaterTest {
  id: number;
  test_date: string;
  ph?: number;
  hardness?: number;
  kh?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  salinity?: number;
  calcium?: number;
  magnesium?: number;
  alkalinity?: number;
  notes?: string;
}

type Fish = AssignedEntry;
type Invert = AssignedEntry;
type Coral = AssignedEntry;

function singularize(type: string) {
  if (type === "fish") return "fish";
  if (type === "plant") return "plant";
  if (type === "coral") return "coral";
  if (type === "inverts") return "invert";
  return type;
}

export default function WorkDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<JWTUser | null>(null);
  const [tank, setTank] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("fish");
  const [entryList, setEntryList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [assignedFish, setAssignedFish] = useState<Fish[]>([]);
  const [assignedPlant, setAssignedPlant] = useState<Plant[]>([]);
  const [assignedInverts, setAssignedInverts] = useState<Invert[]>([]);
  const [assignedCoral, setAssignedCoral] = useState<Coral[]>([]);
  const [latestWaterTest, setLatestWaterTest] = useState<WaterTest | null>(null);

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

  const fetchLatestWaterTest = async () => {
    const res = await fetch(`/api/work/${id}/water`);
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) setLatestWaterTest(data[0]);
    }
  };

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

  const assignItem = async () => {
    if (!selectedId) return;
    const res = await fetch(`/api/work/${id}`, {
      method: "POST",
      body: JSON.stringify({ type: selectedType, entryId: selectedId }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      alert(`${selectedType} added to tank!`);
      setSelectedId("");
      await loadAssigned();
    } else {
      alert(`Failed to assign ${selectedType}`);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userData = await getUserFromClientCookies();
      setUser(userData);

      const tankRes = await fetch(`/api/work/${id}`);
      setTank(await tankRes.json());

      const entries = await fetch(`/api/${selectedType}`);
      setEntryList(await entries.json());

      await loadAssigned();
      await fetchLatestWaterTest();
    };

    init();
  }, [id, selectedType]);

  if (!user || !tank) {
    return (
      <ClientLayoutWrapper user={user as JWTUser}>
        <div className="p-6">Loading...</div>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Tank #{id} Details</h1>
        <p><strong>Water Type:</strong> {tank.water_type}</p>
        <p><strong>Gallons:</strong> {tank.gallons}</p>

        {/* Latest water test summary */}
        {latestWaterTest && (
          <div className="my-4 p-4 bg-blue-50 border rounded">
            <h2 className="font-semibold mb-2">Most Recent Water Test</h2>
            <p><strong>Date:</strong> {new Date(latestWaterTest.test_date).toLocaleString()}</p>
            <p><strong>pH:</strong> {latestWaterTest.ph ?? "N/A"}</p>
            <p><strong>Hardness:</strong> {latestWaterTest.hardness ?? "N/A"}</p>
            <p><strong>Ammonia:</strong> {latestWaterTest.ammonia ?? "N/A"}</p>
            <p><strong>Nitrite:</strong> {latestWaterTest.nitrite ?? "N/A"}</p>
            <p><strong>Nitrate:</strong> {latestWaterTest.nitrate ?? "N/A"}</p>
            <p><strong>Salinity:</strong> {latestWaterTest.salinity ?? "N/A"}</p>
            {latestWaterTest.notes && (
              <p><strong>Notes:</strong> {latestWaterTest.notes}</p>
            )}
          </div>
        )}

        {/* Links */}
        <div className="my-4">
          <Link href={`/work/${id}/water`} className="text-blue-600 underline hover:text-blue-800">
            View & Log Water Tests
          </Link>
        </div>

        <div className="my-4">
          <Link href={`/work/${id}/maintenance`} className="text-blue-600 underline hover:text-blue-800">
            🧪 Maintenance Log
          </Link>
        </div>

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

        {/* Assigned items */}
        <div className="mt-6 space-y-8">
          {[{ type: "fish", label: "Fish", entries: assignedFish },
            { type: "inverts", label: "Inverts", entries: assignedInverts },
            { type: "plant", label: "Plants", entries: assignedPlant },
            { type: "coral", label: "Coral", entries: assignedCoral }].map(({ type, label, entries }) => (
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
  {entries.map((entry, index) => {
    if (type === "plant") {
      const plant = entry as Plant;
      return (
        <tr key={`${type}-${plant.id}-${index}`}>
          <td className="border px-2 py-1">{plant.name}</td>
          <td className="border px-2 py-1">{plant.light_level || "N/A"}</td>
          <td className="border px-2 py-1">{plant.co2_required ? "Yes" : "No"}</td>
          <td className="border px-2 py-1">{plant.temperature_range || "?"}</td>
          <td className="border px-2 py-1 text-center">
            <button
              onClick={() => handleDelete(type, plant.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </td>
        </tr>
      );
    } else {
      const item = entry as AssignedEntry;
      return (
        <tr key={`${type}-${item.id}-${index}`}>
          <td className="border px-2 py-1">{item.name}</td>
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
        </tr>
      );
    }
  })}
</tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </div>
    </ClientLayoutWrapper>
  );
}
