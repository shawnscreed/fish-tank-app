// 📄 File: src/app/dashboard/products/page.tsx

export const dynamic = "force-dynamic";

import { getUserFromServer } from "@/lib/auth-server";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import ProductsClientPage from "@/components/ProductsClientPage"; // ✅ Make sure this exists

export default async function ProductsPage() {
  const user = await getUserFromServer();

  return (
    <ClientLayoutWrapper user={user}>
      <ProductsClientPage />
    </ClientLayoutWrapper>
  );
}
