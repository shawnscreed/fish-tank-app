"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import { useSession } from "next-auth/react";
import type { JWTUser, Role } from "@/lib/auth";

type WishlistItem = {
  id: number;
  tank_id: number;
  species_type: "fish" | "plant" | "invert" | "coral";
  species_id: number;
  created_at: string;
  name: string; // Species name fetched from backend API
};

export default function TankWishlistPage() {
  const { id: tankId } = useParams();
  const { data: session, status } = useSession();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setMessage("You must be logged in to view the wishlist.");
      setLoading(false);
      return;
    }

    async function fetchWishlist() {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(`/api/tankwishlist/${tankId}`);
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data: WishlistItem[] = await res.json();
        setWishlist(data);
      } catch (e) {
        console.error(e);
        setWishlist([]);
        setMessage("Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [tankId, session, status]);

  const addToTank = async (wishlistItemId: number) => {
    if (!session) {
      setMessage("You must be logged in to add species.");
      return;
    }

    setAddingId(wishlistItemId);
    setMessage(null);

    const item = wishlist.find((w) => w.id === wishlistItemId);
    if (!item) {
      setMessage("Invalid wishlist item");
      setAddingId(null);
      return;
    }

    const routeMap: Record<string, string> = {
      fish: "/api/tankfish",
      plant: "/api/tankplant",
      invert: "/api/tankinverts",
      coral: "/api/tankcoral",
    };
    const route = routeMap[item.species_type];
    if (!route) {
      setMessage("Invalid species type");
      setAddingId(null);
      return;
    }

    try {
      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tank_id: tankId,
          [`${item.species_type}_id`]: item.species_id,
        }),
      });
      if (!res.ok) throw new Error("Failed to add species to tank");

      setMessage(`Added ${item.species_type} to tank!`);

      // Remove added item from wishlist locally
      setWishlist(wishlist.filter((w) => w.id !== wishlistItemId));
    } catch (e) {
      setMessage("Failed to add species. Try again.");
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  // Provide user info for layout
  const userForLayout: JWTUser = session?.user
    ? {
        id: Number(session.user.id),
        email: session.user.email ?? "",
        role: (session.user.role ?? "user") as Role,
        name: session.user.name ?? undefined,
      }
    : {
        id: 0,
        email: "",
        role: "user",
      };

  if (status === "loading") {
    return (
      <ClientLayoutWrapper user={userForLayout}>
        <MainContainer>
          <p>Loading session...</p>
        </MainContainer>
      </ClientLayoutWrapper>
    );
  }

  if (!session) {
    return (
      <ClientLayoutWrapper user={userForLayout}>
        <MainContainer>
          <p className="text-red-600">You must be logged in to view this page.</p>
        </MainContainer>
      </ClientLayoutWrapper>
    );
  }

  if (loading) {
    return (
      <ClientLayoutWrapper user={userForLayout}>
        <MainContainer>
          <p>Loading wishlist...</p>
        </MainContainer>
      </ClientLayoutWrapper>
    );
  }

  if (wishlist.length === 0) {
    return (
      <ClientLayoutWrapper user={userForLayout}>
        <MainContainer>
          <p>No wishlist items yet.</p>
          {message && <p className="text-red-600 mt-2">{message}</p>}
        </MainContainer>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper user={userForLayout}>
      <MainContainer>
        {message && <p className="text-green-600 font-semibold mb-4">{message}</p>}

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Added On</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1 capitalize">{item.species_type}</td>
                <td className="border px-2 py-1">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    onClick={() => addToTank(item.id)}
                    disabled={addingId === item.id}
                    className={`px-3 py-1 rounded text-white ${
                      addingId === item.id ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {addingId === item.id ? "Adding..." : "Add to Tank"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
