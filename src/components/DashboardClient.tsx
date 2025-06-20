"use client";

import { useState } from "react";
import WorkWizard from "@/components/WorkWizard"; // You'll need to create this
import AddTankForm from "@/components/AddTankForm";
import WorkTable from "@/components/WorkTable";

export default function DashboardClient({
  userId,
  tanks,
}: {
  userId: number;
  tanks: any[];
}) {
  const [activeTankId, setActiveTankId] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Tanks</h2>
      {tanks.length === 0 ? (
        <p>No tanks found.</p>
      ) : (
        <ul className="list-disc list-inside mb-6">
          {tanks.map((tank) => (
            <li key={tank.id}>
              <button
                onClick={() => setActiveTankId(tank.id)}
                className="text-blue-600 underline"
              >
                Work on <strong>{tank.name}</strong>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddTankForm userId={userId} />

      {activeTankId && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            Work in Progress for Tank #{activeTankId}
          </h2>
          <WorkWizard userId={userId} tankId={activeTankId} />
        </>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-2">Your Work Entries</h2>
      <WorkTable userId={userId} />
    </div>
  );
}
