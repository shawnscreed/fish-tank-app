"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromClientCookies, JWTUser } from "@/lib/auth";

interface Product {
  id: number;
  name: string;
  notes?: string;
  buy_url?: string;
}

export default function ProductsPage() {
  const [user, setUser] = useState<JWTUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await getUserFromClientCookies();
      setUser(u);

      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Products & Chemicals</h1>

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 shadow bg-white">
                <h2 className="font-semibold text-lg">{product.name}</h2>
                {product.notes && (
                  <p className="text-sm text-gray-600 mt-1">{product.notes}</p>
                )}
                {product.buy_url && (
                  <a
                    href={product.buy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-blue-600 underline"
                  >
                    Click Me to View More Details
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/dashboard" className="text-blue-600 underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </ClientLayoutWrapper>
  );
}
