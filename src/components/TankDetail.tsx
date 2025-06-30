// 📄 Page: /dashboard/tank/[id]

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tank {
  id: number;
  name: string;
  gallons: number;
  water_type: string;
}

interface WaterTest {
  created_at: string;
  ph: number;
  hardness: number;
  temperature?: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  salinity?: number;
  notes?: string;
}

export default function TankDetail({
  userId,
  tankId,
}: {
  userId: number;
  tankId: number;
}) {
  const [tank, setTank] = useState<Tank | null>(null);
  const [name, setName] = useState("");
  const [gallons, setGallons] = useState(0);
  const [latestTest, setLatestTest] = useState<WaterTest | null>(null);
  const [loading, setLoading] = useState(true);

  const [fish, setFish] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [inverts, setInverts] = useState<any[]>([]);
  const [corals, setCorals] = useState<any[]>([]);

  const [availableFish, setAvailableFish] = useState<any[]>([]);
  const [availablePlants, setAvailablePlants] = useState<any[]>([]);
  const [availableInverts, setAvailableInverts] = useState<any[]>([]);
  const [availableCorals, setAvailableCorals] = useState<any[]>([]);

  const [alerts, setAlerts] = useState<string[]>([]);

  const loadTankDetails = async () => {
    try {
      const responses = await Promise.all([
        fetch(`/api/tanks/${tankId}?user_id=${userId}`),
        fetch(`/api/tanks/${tankId}/water-latest`),
        fetch(`/api/tanks/${tankId}/fish`),
        fetch(`/api/tanks/${tankId}/plant`),
        fetch(`/api/tanks/${tankId}/inverts`),
        fetch(`/api/tanks/${tankId}/coral`),
        fetch(`/api/fish`),
        fetch(`/api/plant`),
        fetch(`/api/inverts`),
        fetch(`/api/coral`),
      ]);

      const [
        tankRes,
        testRes,
        fishRes,
        plantRes,
        invertRes,
        coralRes,
        fishList,
        plantList,
        invertList,
        coralList,
      ] = responses;

      const tankData = await tankRes.json();
      setTank(tankData);
      setName(tankData.name || "");
      setGallons(tankData.gallons || 0);

      setLatestTest(testRes.ok ? await testRes.json() : null);
      setFish(fishRes.ok ? await fishRes.json() : []);
      setPlants(plantRes.ok ? await plantRes.json() : []);
      setInverts(invertRes.ok ? await invertRes.json() : []);
      setCorals(coralRes.ok ? await coralRes.json() : []);

      const wt = tankData.water_type;
      const filterByWaterType = (list: any[]) =>
        list.filter((i) => wt === "brackish" || i.water_type === wt);

  const sortByName = (arr: any[]) =>
  arr.sort((a, b) => a.name.localeCompare(b.name)); 

  setAvailableFish(fishList.ok ? sortByName(filterByWaterType(await fishList.json())) : []);
setAvailablePlants(plantList.ok ? sortByName(filterByWaterType(await plantList.json())) : []);
setAvailableInverts(invertList.ok ? sortByName(filterByWaterType(await invertList.json())) : []);
setAvailableCorals(coralList.ok ? sortByName(filterByWaterType(await coralList.json())) : []);
    } catch (err) {
      console.error("Failed to load tank data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tankId) loadTankDetails();
    const handleFocus = () => loadTankDetails();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [tankId, userId]);

  useEffect(() => {
    if (!latestTest || fish.length === 0) return;

    const newAlerts: string[] = [];

    fish.forEach((f) => {
      if (
        f.ph_low !== null &&
        f.ph_high !== null &&
        (latestTest.ph < f.ph_low || latestTest.ph > f.ph_high)
      ) {
        newAlerts.push(`${f.name} is outside its preferred pH range.`);
      }

      if (
        f.temp_low !== null &&
        f.temp_high !== null &&
        latestTest.temperature !== undefined &&
        (latestTest.temperature < f.temp_low || latestTest.temperature > f.temp_high)
      ) {
        newAlerts.push(`${f.name} is outside its preferred temperature range.`);
      }

      if (
        f.hardness_low !== null &&
        f.hardness_high !== null &&
        (latestTest.hardness < f.hardness_low || latestTest.hardness > f.hardness_high)
      ) {
        newAlerts.push(`${f.name} is outside its preferred hardness range.`);
      }
    });

    setAlerts(newAlerts);
  }, [latestTest, fish]);

  const saveTank = async () => {
    await fetch(`/api/tanks/${tankId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gallons }),
    });
  };

  const typeToIdKey: Record<string, string> = {
    fish: "fish_id",
    plants: "plant_id",
    inverts: "invert_id",
    corals: "coral_id",
  };

  const typeToRoute: Record<string, string> = {
    fish: "/api/tankfish",
    plants: "/api/tankplant",
    inverts: "/api/tankinverts",
    corals: "/api/tankcoral",
  };

  const assignItem = async (type: string, itemId: number) => {
    await fetch(typeToRoute[type], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tank_id: tankId,
        [typeToIdKey[type]]: itemId,
      }),
    });
    loadTankDetails();
  };

  const deleteItem = async (
    type: string,
    itemId: number,
    assignmentId?: number
  ) => {
    const rowId = assignmentId ?? itemId;
    await fetch(typeToRoute[type], {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowId }),
    });
    loadTankDetails();
  };

  const typeLabels: Record<string, string> = {
    fish: "fish",
    plants: "plant",
    inverts: "invert",
    corals: "coral",
  };

  const renderSection = (type: string, list: any[], options: any[]) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-1 capitalize">
        {typeLabels[type]}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const id = parseInt(
            (e.currentTarget as any)[`select_${type}`].value
          );
          if (id) assignItem(type, id);
        }}
        className="mb-2"
      >
        <select name={`select_${type}`} className="border px-2 py-1 mr-2">
          <option value="">Select {typeLabels[type]}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Assign
        </button>
      </form>
      {list.length === 0 ? (
        <p className="text-gray-600">No {typeLabels[type]} assigned yet.</p>
      ) : (
        <table className="w-full mt-2 border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">pH</th>
              <th className="border px-2 py-1">Hardness</th>
              <th className="border px-2 py-1">Temp</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={`${type}-${item.assignment_id ?? item.id}`}>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1">
                  {item.ph_low ?? "N/A"}–{item.ph_high ?? "N/A"}
                </td>
                <td className="border px-2 py-1">
                  {item.hardness_low ?? "N/A"}–{item.hardness_high ?? "N/A"}
                </td>
                <td className="border px-2 py-1">
                  {item.temp_low ?? "N/A"}–{item.temp_high ?? "N/A"}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() =>
                      deleteItem(type, item.id, item.assignment_id)
                    }
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading) return <p>Loading tank...</p>;
  if (!tank) return <p>Tank not found or access denied.</p>;

  return (
    <div className="p-4 max-w-3xl space-y-6">
      {alerts.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          <h2 className="font-bold mb-2">⚠️ Water Parameter Alerts</h2>
          <ul className="list-disc ml-6">
            {alerts.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <h1 className="text-2xl font-bold">{name || `Unnamed Tank`}</h1>

      <div>
        <label className="block text-sm font-medium text-gray-600">
          Tank Name
        </label>
        <input
          className="w-full px-3 py-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveTank}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600">
          Gallons
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded"
          value={gallons}
          onChange={(e) => setGallons(Number(e.target.value))}
          onBlur={saveTank}
        />
      </div>

      <p>
        <strong>Water Type:</strong> {tank.water_type}
        <br />
        <strong>Gallons:</strong> {gallons}
      </p>

      <Link
        href={`/dashboard/tank/${tankId}/water`}
        className="block text-blue-600 underline hover:text-blue-800"
      >
        View & Log Water Tests
      </Link>

      <Link href={`/dashboard/tank/${tankId}/maintenance`}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto">
          🧰 View Maintenance Logs
        </button>
      </Link>

      {latestTest && (
        <div className="bg-blue-50 border p-4 mt-4 rounded">
          <h2 className="text-lg font-semibold mb-2">
            Most Recent Water Test
          </h2>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(latestTest.created_at).toLocaleString()}
          </p>
          <p>
            <strong>pH:</strong> {latestTest.ph}
          </p>
          <p>
            <strong>Hardness:</strong> {latestTest.hardness}
          </p>
          <p>
            <strong>Ammonia:</strong> {latestTest.ammonia}
          </p>
          <p>
            <strong>Nitrite:</strong> {latestTest.nitrite}
          </p>
          <p>
            <strong>Nitrate:</strong> {latestTest.nitrate}
          </p>
          <p>
            <strong>Salinity:</strong> {latestTest.salinity ?? "N/A"}
          </p>
          <p>
            <strong>Notes:</strong> {latestTest.notes ?? "None"}
          </p>
        </div>
      )}

      <div className="mt-6">
        {renderSection("fish", fish, availableFish)}
        {renderSection("plants", plants, availablePlants)}
        {renderSection("inverts", inverts, availableInverts)}
        {(tank.water_type === "salt" || tank.water_type === "brackish") &&
          renderSection("corals", corals, availableCorals)}
      </div>
    </div>
  );
}