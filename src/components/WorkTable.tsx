"use client";
import { useEffect, useState } from "react";

export default function WorkTable({ userId }: { userId: number }) {
  const [work, setWork] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/work")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((item: any) => item.user_id === userId);
        setWork(filtered);
      });
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Work Entries</h2>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Tank</th>
            <th className="border px-2 py-1">Step</th>
            <th className="border px-2 py-1">Complete</th>
          </tr>
        </thead>
        <tbody>
          {work.map((item) => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.tank_id}</td>
              <td className="border px-2 py-1">{item.current_step}</td>
              <td className="border px-2 py-1">{item.is_complete ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
