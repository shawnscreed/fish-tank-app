// 📄 File: src/app/dashboard/products/page.tsx

export const dynamic = "force-dynamic";

import { getUserFromServer } from "@/lib/auth-server";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import ProductsClientPage from "@/components/ProductsClientPage";

export default async function ProductsPage() {
  const user = (await getUserFromServer())!; // ✅ Assert non-null (protected by redirect inside)

  return (
    <ClientLayoutWrapper user={user}>
      <ProductsClientPage />
    </ClientLayoutWrapper>
  );
}
