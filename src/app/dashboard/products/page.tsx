// 📄 File: src/app/dashboard/products/page.tsx

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
