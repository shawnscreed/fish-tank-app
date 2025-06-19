// Page: app/work/[id]/water/page.tsx - Allows logging water tests for a specific tank

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";

interface Tank {
  id: number;
  water_type: "fresh" | "salt" | "brackish";
  gallons: number;
}

interface WaterTest {
  id: number;
  tank_id: number;
  ph?: number;
  hardness?: number;
  salinity?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  created_at: string;
}

export default function WaterTestPage() {
  const { id } = useParams();
  const [tank, setTank] = useState<Tank | null>(null);
  const [tests, setTests] = useState<WaterTest[]>([]);

  const [ph, setPh] = useState(7.0);
  const [hardness, setHardness] = useState<number | null>(null);
  const [salinity, setSalinity] = useState<number | null>(null);
  const [ammonia, setAmmonia] = useState<number | null>(null);
  const [nitrite, setNitrite] = useState<number | null>(null);
  const [nitrate, setNitrate] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/work/${id}`).then(res => res.json()).then(setTank);
    fetch(`/api/work/${id}/water`).then(res => res.json()).then(setTests);
  }, [id]);

  const saveTest = async () => {
    const res = await fetch(`/api/work/${id}/water`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ph, hardness, salinity, ammonia, nitrite, nitrate })
    });
    if (res.ok) {
      const newTest = await res.json();
      setTests(prev => [newTest, ...prev]);
    } else {
      alert("Failed to save water test");
    }
  };

  if (!tank) return <ClientLayout><div className="p-6">Loading tank info...</div></ClientLayout>;

  return (
    <ClientLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-bold">Water Tests for Tank #{id}</h1>
        <p><strong>Type:</strong> {tank.water_type} | <strong>Gallons:</strong> {tank.gallons}</p>

        {/* New Test Form */}
        <div className="bg-gray-50 border rounded p-4">
          <h2 className="font-semibold mb-2">Log Water Test</h2>
          <div className="grid grid-cols-2 gap-4">
            <label>pH: <input type="number" value={ph} step="0.1" onChange={e => setPh(parseFloat(e.target.value))} /></label>
            {tank.water_type !== 'fresh' && (
              <label>Salinity (ppt): <input type="number" value={salinity ?? ''} onChange={e => setSalinity(parseFloat(e.target.value))} /></label>
            )}
            <label>Hardness (GH): <input type="number" value={hardness ?? ''} onChange={e => setHardness(parseFloat(e.target.value))} /></label>
            <label>Ammonia (ppm): <input type="number" value={ammonia ?? ''} onChange={e => setAmmonia(parseFloat(e.target.value))} /></label>
            <label>Nitrite (ppm): <input type="number" value={nitrite ?? ''} onChange={e => setNitrite(parseFloat(e.target.value))} /></label>
            <label>Nitrate (ppm): <input type="number" value={nitrate ?? ''} onChange={e => setNitrate(parseFloat(e.target.value))} /></label>
          </div>
          <button onClick={saveTest} className="mt-4 bg-blue-600 text-white px-4 py-1 rounded">Save Test</button>
        </div>

        {/* Test History */}
        <div>
          <h2 className="font-semibold mb-2">Previous Tests</h2>
          {tests.length === 0 ? <p>No tests logged yet.</p> : (
            <table className="table-auto text-sm border-collapse w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">pH</th>
                  <th className="border px-2 py-1">Hardness</th>
                  {tank.water_type !== 'fresh' && <th className="border px-2 py-1">Salinity</th>}
                  <th className="border px-2 py-1">Ammonia</th>
                  <th className="border px-2 py-1">Nitrite</th>
                  <th className="border px-2 py-1">Nitrate</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => (
                  <tr key={test.id}>
                    <td className="border px-2 py-1">{new Date(test.created_at).toLocaleString()}</td>
                    <td className="border px-2 py-1">{test.ph ?? '?'}</td>
                    <td className="border px-2 py-1">{test.hardness ?? '?'}</td>
                    {tank.water_type !== 'fresh' && <td className="border px-2 py-1">{test.salinity ?? '?'}</td>}
                    <td className="border px-2 py-1">{test.ammonia ?? '?'}</td>
                    <td className="border px-2 py-1">{test.nitrite ?? '?'}</td>
                    <td className="border px-2 py-1">{test.nitrate ?? '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
