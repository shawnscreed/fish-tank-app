// 📄 File: app/components/TankDetail.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  ammonia: number;
  nitrite: number;
  nitrate: number;
  salinity?: number;
  notes?: string;
}

export default function TankDetail({ userId }: { userId: number }) {
  const params = useParams();
  const tankId = parseInt(params?.id as string || "0");

  const [tank, setTank] = useState<Tank | null>(null);
  const [latestTest, setLatestTest] = useState<WaterTest | null>(null);
  const [fish, setFish] = useState<any[]>([]);
  const [availableFish, setAvailableFish] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [inverts, setInverts] = useState<any[]>([]);
  const [corals, setCorals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTankDetails() {
    const responses = await Promise.all([
      fetch(`/api/tanks/${tankId}?user_id=${userId}`),
      fetch(`/api/tanks/${tankId}/water-latest`),
      fetch(`/api/tanks/${tankId}/fish`),
      fetch(`/api/tanks/${tankId}/plants`),
      fetch(`/api/tanks/${tankId}/inverts`),
      fetch(`/api/tanks/${tankId}/corals`),
      fetch(`/api/fish`),
    ]);

    const [tankRes, testRes, fishRes, plantRes, invertRes, coralRes, allFishRes] = responses;

    if (!tankRes.ok) throw new Error("Tank fetch failed");
    if (!fishRes.ok) throw new Error("Fish fetch failed");

    const tankData = await tankRes.json();
    const testData = testRes.ok ? await testRes.json() : null;
    const fishData = fishRes.ok ? await fishRes.json() : [];
    const plantData = plantRes.ok ? await plantRes.json() : [];
    const invertData = invertRes.ok ? await invertRes.json() : [];
    const coralData = coralRes.ok ? await coralRes.json() : [];
    const availableFishData = allFishRes.ok ? await allFishRes.json() : [];

    setTank(tankData);
    setLatestTest(testData);
    setFish(fishData);
    setAvailableFish(availableFishData);
    setPlants(plantData);
    setInverts(invertData);
    setCorals(coralData);
    setLoading(false);
  }

  useEffect(() => {
    if (tankId) loadTankDetails();
  }, [tankId, userId]);

  if (loading) return <p>Loading tank...</p>;
  if (!tank) return <p>Tank not found or access denied.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Tank #{tank.id} Details</h1>
      <p>
        <strong>Water Type:</strong> {tank.water_type}<br />
        <strong>Gallons:</strong> {tank.gallons}
      </p>

      {latestTest && (
        <div className="bg-blue-50 border p-4 mt-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Most Recent Water Test</h2>
          <p><strong>Date:</strong> {new Date(latestTest.created_at).toLocaleString()}</p>
          <p><strong>pH:</strong> {latestTest.ph}</p>
          <p><strong>Hardness:</strong> {latestTest.hardness}</p>
          <p><strong>Ammonia:</strong> {latestTest.ammonia}</p>
          <p><strong>Nitrite:</strong> {latestTest.nitrite}</p>
          <p><strong>Nitrate:</strong> {latestTest.nitrate}</p>
          <p><strong>Salinity:</strong> {latestTest.salinity ?? "N/A"}</p>
          <p><strong>Notes:</strong> {latestTest.notes ?? "None"}</p>
        </div>
      )}

      <div className="mt-4">
        <a href={`/dashboard/tank/${tankId}/water-tests`} className="text-blue-600 underline mr-4">
          View & Log Water Tests
        </a>
        <a href={`/dashboard/tank/${tankId}/maintenance`} className="text-blue-600 underline">
          🛠️ Maintenance Log
        </a>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Assigned Fish</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fish_id = form.fish_id.value;
            if (!fish_id) return;

            await fetch(`/api/tanks/${tankId}/fish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fish_id }),
            });

            form.reset();
            await loadTankDetails();
          }}
          className="mb-4"
        >
          <select name="fish_id" className="border px-2 py-1 mr-2">
            <option value="">Select fish</option>
            {availableFish.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
            Assign
          </button>
        </form>

        {fish.length === 0 ? (
          <p>No fish assigned yet.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">pH</th>
                <th className="border px-2 py-1">Hardness</th>
                <th className="border px-2 py-1">Temp</th>
                <th className="border px-2 py-1">Aggression</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {fish.map((f) => (
                <tr key={f.id}>
                  <td className="border px-2 py-1">{f.name}</td>
                  <td className="border px-2 py-1">{f.ph_low}–{f.ph_high}</td>
                  <td className="border px-2 py-1">{f.hardness_low}–{f.hardness_high}</td>
                  <td className="border px-2 py-1">{f.temp_low}–{f.temp_high}</td>
                  <td className="border px-2 py-1">{f.aggressiveness}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={async () => {
                        await fetch(`/api/tanks/${tankId}/fish`, {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ fish_id: f.id }),
                        });
                        await loadTankDetails();
                      }}
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
    </div>
  );
}
