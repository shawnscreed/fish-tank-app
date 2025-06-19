// File: app/work/[id]/water/page.tsx
// Description: Allows logging and viewing water test results for a specific tank

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";

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

export default function WaterTestPage() {
  const { id } = useParams();
  const [tank, setTank] = useState<any>(null);
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [formData, setFormData] = useState<any>({ notes: "" });

  const fetchTank = async () => {
    const res = await fetch(`/api/work/${id}`);
    const tank = await res.json();
    setTank(tank);
  };

  const fetchTests = async () => {
    const res = await fetch(`/api/work/${id}/water`);
    const data = await res.json();
    setTests(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/work/${id}/water`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      alert("Water test saved!");
      setFormData({ notes: "" });
      fetchTests();
    } else {
      alert("Failed to save test.");
    }
  };

  useEffect(() => {
    fetchTank();
    fetchTests();
  }, [id]);

  if (!tank) return <ClientLayout><div className="p-6">Loading...</div></ClientLayout>;

  const isSalt = tank.water_type === "salt";
  const isFresh = tank.water_type === "fresh";

  return (
    <ClientLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="text-xl font-bold mb-4">Water Tests for Tank #{id}</h1>
        <p><strong>Water Type:</strong> {tank.water_type}</p>
        <p><strong>Gallons:</strong> {tank.gallons}</p>

        {/* Water Test Form */}
        <div className="bg-gray-100 border p-4 rounded my-6 shadow">
          <h2 className="font-semibold mb-2">Log New Water Test</h2>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" name="ph" placeholder="pH" onChange={handleChange} className="border p-2" />
            <input type="number" name="hardness" placeholder="Hardness" onChange={handleChange} className="border p-2" />
            <input type="number" name="kh" placeholder="KH" onChange={handleChange} className="border p-2" />
            <input type="number" name="ammonia" placeholder="Ammonia" onChange={handleChange} className="border p-2" />
            <input type="number" name="nitrite" placeholder="Nitrite" onChange={handleChange} className="border p-2" />
            <input type="number" name="nitrate" placeholder="Nitrate" onChange={handleChange} className="border p-2" />
            {isSalt && (
              <>
                <input type="number" name="salinity" placeholder="Salinity" onChange={handleChange} className="border p-2" />
                <input type="number" name="calcium" placeholder="Calcium" onChange={handleChange} className="border p-2" />
                <input type="number" name="magnesium" placeholder="Magnesium" onChange={handleChange} className="border p-2" />
                <input type="number" name="alkalinity" placeholder="Alkalinity" onChange={handleChange} className="border p-2" />
              </>
            )}
          </div>
          <textarea name="notes" placeholder="Notes" onChange={handleChange} className="border p-2 mt-3 w-full"></textarea>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mt-3">
            Submit Test
          </button>
        </div>

        {/* Past Test Records */}
        <h2 className="text-lg font-bold mt-8 mb-3">Previous Tests</h2>
        {tests.length === 0 ? (
          <p>No tests recorded yet.</p>
        ) : (
          <table className="table-auto w-full text-sm border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">pH</th>
                <th className="border px-2 py-1">Hardness</th>
                <th className="border px-2 py-1">KH</th>
                <th className="border px-2 py-1">Ammonia</th>
                <th className="border px-2 py-1">Nitrite</th>
                <th className="border px-2 py-1">Nitrate</th>
                {isSalt && (
                  <>
                    <th className="border px-2 py-1">Salinity</th>
                    <th className="border px-2 py-1">Calcium</th>
                    <th className="border px-2 py-1">Magnesium</th>
                    <th className="border px-2 py-1">Alkalinity</th>
                  </>
                )}
                <th className="border px-2 py-1">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => (
                <tr key={test.id}>
                  <td className="border px-2 py-1">{new Date(test.test_date).toLocaleString()}</td>
                  <td className="border px-2 py-1">{test.ph ?? "-"}</td>
                  <td className="border px-2 py-1">{test.hardness ?? "-"}</td>
                  <td className="border px-2 py-1">{test.kh ?? "-"}</td>
                  <td className="border px-2 py-1">{test.ammonia ?? "-"}</td>
                  <td className="border px-2 py-1">{test.nitrite ?? "-"}</td>
                  <td className="border px-2 py-1">{test.nitrate ?? "-"}</td>
                  {isSalt && (
                    <>
                      <td className="border px-2 py-1">{test.salinity ?? "-"}</td>
                      <td className="border px-2 py-1">{test.calcium ?? "-"}</td>
                      <td className="border px-2 py-1">{test.magnesium ?? "-"}</td>
                      <td className="border px-2 py-1">{test.alkalinity ?? "-"}</td>
                    </>
                  )}
                  <td className="border px-2 py-1">{test.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClientLayout>
  );
}
