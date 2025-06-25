// 📄 File: src/app/dashboard/tank/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import TankDetail from "@/components/TankDetail";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function TankDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Await the params

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.warn("❌ No session found, redirecting to login");
    redirect("/login");
  }

  const user = {
    id: Number((session.user as any).id),
    name: session.user.name || "",
    email: session.user.email || "",
    role: (session.user as any).role as Role,
  };

  const tankId = Number(id);

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <TankDetail userId={user.id} tankId={tankId} />
      </div>
    </ClientLayoutWrapper>
  );
}
