// 📄 src/components/ProductsClientPage.tsx
"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  buy_url: string;
  notes?: string;
}

export default function ProductsClientPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error(
            `Server responded ${res.status} ${res.statusText || ""}`.trim()
          );
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("API returned unexpected format");
        }

        setProducts(data);
      } catch (err: any) {
        console.error("❌ Products fetch failed:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)   return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-500 italic">No products found.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border p-4 rounded shadow">
              <p className="font-semibold">{product.name}</p>
              {product.notes && (
                <p className="text-sm text-gray-500">{product.notes}</p>
              )}

              <button
                className="text-blue-600 underline mt-2"
                onClick={() => window.open(product.buy_url, "_blank")}
              >
                Click Me to View More Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
