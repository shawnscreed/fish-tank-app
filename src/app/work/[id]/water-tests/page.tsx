"use client";

// 📄 File: app/work/[id]/water-tests/page.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { useSession } from "next-auth/react";
import { JWTUser } from "@/lib/auth";

interface WaterTest {
  id: number;
  tank_id: number;
  test_type: string;
  value: number;
  unit: string;
  tested_at: string;
}

const testOptionsByType: Record<string, { test_type: string; unit: string }[]> = {
  freshwater: [
    { test_type: "pH", unit: "" },
    { test_type: "Hardness (GH)", unit: "ppm" },
    { test_type: "Alkalinity (KH)", unit: "ppm" },
    { test_type: "Ammonia", unit: "ppm" },
    { test_type: "Nitrite", unit: "ppm" },
    { test_type: "Nitrate", unit: "ppm" },
  ],
  salt: [
    { test_type: "pH", unit: "" },
    { test_type: "Salinity", unit: "ppt" },
    { test_type: "Calcium", unit: "ppm" },
    { test_type: "Alkalinity (KH)", unit: "ppm" },
    { test_type: "Magnesium", unit: "ppm" },
    { test_type: "Nitrate", unit: "ppm" },
  ],
  brackish: [
    { test_type: "pH", unit: "" },
    { test_type: "Salinity", unit: "ppt" },
    { test_type: "Hardness (GH)", unit: "ppm" },
    { test_type: "Nitrate", unit: "ppm" },
  ],
};

export default function WaterTestsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<JWTUser | null>(null);

  const [tank, setTank] = useState<any>(null);
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [form, setForm] = useState({ test_type: "", value: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user) {
      const { id, name, email, role } = session.user as any;
      setCurrentUser({ id: Number(id), name, email, role });
    }
  }, [status, session, router]);

  useEffect(() => {
    if (id) {
      fetch(`/api/work/${id}`).then(res => res.json()).then(setTank);
      fetchTests();
    }
  }, [id]);

  const fetchTests = async () => {
    const res = await fetch(`/api/water-tests/${id}`);
    const data = await res.json();
    setTests(data);
  };

  const handleSubmit = async () => {
    if (!form.test_type || !form.value) return;
    const option = testOptionsByType[tank?.water_type]?.find(t => t.test_type === form.test_type);
    const res = await fetch(`/api/water-tests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test_type: form.test_type,
        value: parseFloat(form.value),
        unit: option?.unit || "",
      }),
    });

    if (res.ok) {
      setForm({ test_type: "", value: "" });
      await fetchTests();
    } else {
      alert("Failed to save water test");
    }
  };

  if (!currentUser || !tank) {
    return (
      <ClientLayoutWrapper user={currentUser as JWTUser}>
        <div className="p-6 text-gray-600">Loading tank...</div>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper user={currentUser}>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Tank #{id} - Water Tests</h1>
        <p><strong>Water Type:</strong> {tank.water_type}</p>
        <p><strong>Gallons:</strong> {tank.gallons}</p>

        <div className="my-4 bg-gray-100 p-4 border rounded">
          <h2 className="font-semibold mb-2">Log New Test</h2>
          <select
            className="border p-1 mr-2"
            value={form.test_type}
            onChange={(e) => setForm({ ...form, test_type: e.target.value })}
          >
            <option value="">Select Test Type</option>
            {testOptionsByType[tank.water_type]?.map(opt => (
              <option key={opt.test_type} value={opt.test_type}>{opt.test_type}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Value"
            className="border p-1 mr-2 w-24"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-2">Test History</h2>
        {tests.length === 0 ? (
          <p>No tests recorded yet.</p>
        ) : (
          <table className="table-auto w-full text-sm border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Test</th>
                <th className="border px-2 py-1">Value</th>
                <th className="border px-2 py-1">Unit</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => (
                <tr key={test.id}>
                  <td className="border px-2 py-1">{new Date(test.tested_at).toLocaleString()}</td>
                  <td className="border px-2 py-1">{test.test_type}</td>
                  <td className="border px-2 py-1">{test.value}</td>
                  <td className="border px-2 py-1">{test.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
