// 📄 File: app/work/[id]/water/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { JWTUser } from "@/lib/auth";

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

interface Tank {
  id: number;
  name: string;
  gallons: number;
  water_type: string;
}

export default function WaterTestPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<JWTUser | null>(null);
  const [tank, setTank] = useState<Tank | null>(null);
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [formData, setFormData] = useState({
    ph: "",
    hardness: "",
    kh: "",
    ammonia: "",
    nitrite: "",
    nitrate: "",
    salinity: "",
    calcium: "",
    magnesium: "",
    alkalinity: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { id, name, email, role } = session.user as any;
      setCurrentUser({ id: Number(id), name, email, role });
    }
  }, [status, session]);

  const fetchTank = async () => {
    const res = await fetch(`/api/work/${id}`);
    if (res.ok) {
      const tank = await res.json();
      setTank(tank);
    }
  };

  const fetchTests = async () => {
    const res = await fetch(`/api/work/${id}/water`);
    if (res.ok) {
      const data = await res.json();
      setTests(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/work/${id}/water`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      alert("Water test saved!");
      setFormData({
        ph: "",
        hardness: "",
        kh: "",
        ammonia: "",
        nitrite: "",
        nitrate: "",
        salinity: "",
        calcium: "",
        magnesium: "",
        alkalinity: "",
        notes: "",
      });
      fetchTests();
    } else {
      alert("Failed to save test.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTank();
      fetchTests();
    }
  }, [id]);

if (!currentUser || !tank || status === "loading") {
  return <div className="p-6 text-gray-600">Loading tank...</div>;
}


  const isSalt = tank.water_type === "salt";

  return (
    <ClientLayoutWrapper user={currentUser}>
      <div className="p-6 max-w-3xl">
        <h1 className="text-xl font-bold mb-4">Water Tests for Tank #{id}</h1>
        <p>
          <strong>Water Type:</strong> {tank.water_type}
        </p>
        <p>
          <strong>Gallons:</strong> {tank.gallons}
        </p>

        {/* Water Test Form */}
        <div className="bg-gray-100 border p-4 rounded my-6 shadow">
          <h2 className="font-semibold mb-2">Log New Water Test</h2>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" name="ph" placeholder="pH" value={formData.ph} onChange={handleChange} className="border p-2" />
            <input type="number" name="hardness" placeholder="Hardness" value={formData.hardness} onChange={handleChange} className="border p-2" />
            <input type="number" name="kh" placeholder="KH" value={formData.kh} onChange={handleChange} className="border p-2" />
            <input type="number" name="ammonia" placeholder="Ammonia" value={formData.ammonia} onChange={handleChange} className="border p-2" />
            <input type="number" name="nitrite" placeholder="Nitrite" value={formData.nitrite} onChange={handleChange} className="border p-2" />
            <input type="number" name="nitrate" placeholder="Nitrate" value={formData.nitrate} onChange={handleChange} className="border p-2" />
            {isSalt && (
              <>
                <input type="number" name="salinity" placeholder="Salinity" value={formData.salinity} onChange={handleChange} className="border p-2" />
                <input type="number" name="calcium" placeholder="Calcium" value={formData.calcium} onChange={handleChange} className="border p-2" />
                <input type="number" name="magnesium" placeholder="Magnesium" value={formData.magnesium} onChange={handleChange} className="border p-2" />
                <input type="number" name="alkalinity" placeholder="Alkalinity" value={formData.alkalinity} onChange={handleChange} className="border p-2" />
              </>
            )}
          </div>
          <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} className="border p-2 mt-3 w-full"></textarea>
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
              {tests.map((test) => (
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
    </ClientLayoutWrapper>
  );
}
