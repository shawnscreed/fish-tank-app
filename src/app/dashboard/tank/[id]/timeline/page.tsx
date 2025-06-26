// 📄 src/app/dashboard/tank/[id]/timeline/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Link from "next/link";

interface TankEvent {
  id: number;
  type: string;   // e.g. "water_test", "fish_added", …
  date: string;
  summary: string;
}

export default function TankTimelinePage() {
  const params = useParams<{ id: string }>();
  const tankId = params.id;

  const { data: session, status } = useSession();
  const [events, setEvents]   = useState<TankEvent[]>([]);
  const [error,  setError]    = useState<string | null>(null);

  // ────────────────────────
  // Fetch events after auth
  // ────────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      try {
        const res = await fetch(`/api/tank/${tankId}/timeline`);
        if (!res.ok) throw new Error(await res.text());
        setEvents(await res.json());
      } catch (e: any) {
        console.error("timeline fetch:", e);
        setError(e.message ?? "Failed to load timeline");
      }
    })();
  }, [status, tankId]);

  // ────────────────────────
  // Filter OUT water-test events
  // ────────────────────────
  const visibleEvents = events.filter(
    (ev) => ev.type !== "water_test" && ev.type !== "WaterTest"
  );
  /* 
     To re-enable later, just replace `visibleEvents` with `events`
     wherever it’s used, or remove the filter line above.
  */

  // ─── UI guards ─────────────────────────────────────────────
  if (status === "loading")  return <div className="p-6">Checking session…</div>;
  if (!session?.user)        return <div className="p-6">Unauthorized – please log in.</div>;

  return (
    <ClientLayoutWrapper
      user={{
        id:   Number((session.user as any).id),
        email: session.user.email!,
        name:  session.user.name ?? "",
        role:  (session.user as any).role ?? "user",
      }}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Tank Timeline</h1>
        <p className="text-gray-600 mb-6">
          A chronological history of this tank’s activity.
        </p>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : visibleEvents.length === 0 ? (
          <p className="text-gray-500 italic">No events found for this tank yet.</p>
        ) : (
          <ol className="relative border-l border-blue-300 pl-4 space-y-6">
            {visibleEvents.map((ev) => (
              <li key={ev.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-blue-600 rounded-full" />
                <time className="block mb-1 text-sm font-medium text-blue-800">
                  {new Date(ev.date).toLocaleString()}
                </time>
                <p className="font-semibold">{ev.summary}</p>
              </li>
            ))}
          </ol>
        )}

        <Link
          href={`/dashboard/tank/${tankId}`}
          className="text-blue-600 underline mt-8 inline-block"
        >
          ← Back to Tank
        </Link>
      </div>
    </ClientLayoutWrapper>
  );
}
