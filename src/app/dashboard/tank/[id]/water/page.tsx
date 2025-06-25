// 📄 File: src/app/dashboard/tank/[id]/water/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import WaterLogPage from "@/components/WaterLogPage";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function WaterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Await the params

  const session = await getServerSession(authOptions);
  if (!session?.user) {
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
      <WaterLogPage userId={user.id} tankId={tankId} />
    </ClientLayoutWrapper>
  );
}
