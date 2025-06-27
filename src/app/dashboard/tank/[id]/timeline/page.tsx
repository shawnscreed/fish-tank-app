"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Link from "next/link";
import type { Role } from "@/lib/auth";

/* ───────── event + icon definitions ───────── */
type TimelineEvent = {
  id: number;
  type:
    | "water_test"
    | "fish_added"
    | "plant_added"
    | "invert_added"
    | "water_change"
    | "maintenance";
  date: string | null;
  summary: string;
};

const eventIcons: Record<TimelineEvent["type"], string> = {
  water_test: "💧",
  fish_added: "🐟",
  plant_added: "🌿",
  invert_added: "🦐",
  water_change: "🔁",
  maintenance: "🛠️",
};
/* ──────────────────────────────────────────── */

export default function TankTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filters, setFilters] = useState<Record<TimelineEvent["type"], boolean>>({
    water_test: true,
    fish_added: true,
    plant_added: true,
    invert_added: true,
    water_change: true,
    maintenance: true,
  });

  /* ───── redirect unauthenticated users ───── */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  /* ───── fetch timeline after auth ───── */
  useEffect(() => {
    if (!id || status !== "authenticated") return;

    fetch(`/api/tank/${id}/timeline`)
      .then(async (res) => {
        if (res.status === 403 || res.status === 404) {
          router.push("/dashboard");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        else console.error("Timeline error:", data);
      })
      .catch(console.error);
  }, [id, status, router]);

  /* ───── loading / redirect placeholders ───── */
  if (status === "loading" || !id) return <div className="p-6">Checking session…</div>;
  if (!session?.user) return <div className="p-6">Redirecting…</div>;

  const user = {
    id: Number((session.user as any).id),
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as any).role as Role ?? "user",
  };

  /* ───── helpers ───── */
  const toggleFilter = (t: TimelineEvent["type"]) =>
    setFilters((prev) => ({ ...prev, [t]: !prev[t] }));

  const visibleEvents = events.filter((ev) => filters[ev.type]);

  /* ───── UI ───── */
  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Tank Timeline</h1>
        <p className="text-gray-600 mb-4">
          A chronological history of this tank’s activity.
        </p>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {(Object.keys(filters) as (keyof typeof filters)[]).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters[type]}
                onChange={() => toggleFilter(type)}
              />
              <span>
                {eventIcons[type]}{" "}
                {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>

        {visibleEvents.length === 0 ? (
          <p className="text-gray-500">No events found for this tank yet.</p>
        ) : (
          <div className="border-l-2 border-blue-500 pl-4 space-y-6">
            {visibleEvents.map((ev) => (
              <div key={`${ev.type}-${ev.id}`} className="relative">
                <div className="absolute -left-[1.05rem] top-1 w-4 h-4 bg-blue-500 rounded-full" />
                <div className="text-sm text-gray-500">
                  {ev.date ? new Date(ev.date).toLocaleString() : "Unknown date"}
                </div>
                <div className="font-semibold">
                  {eventIcons[ev.type]} {ev.summary}
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          href={`/dashboard/tank/${id}`}
          className="mt-8 inline-block text-blue-600 hover:underline"
        >
          ← Back to Tank
        </Link>
      </div>
    </ClientLayoutWrapper>
  );
}
