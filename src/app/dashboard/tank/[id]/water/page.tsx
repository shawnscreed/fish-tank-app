// 📄 File: src/app/dashboard/tank/[id]/water-tests/page.tsx
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";

export default async function WaterTestsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = {
    id: Number(session.user.id),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as any).role,
  };

  const tankId = Number(params.id);

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-4">Water Tests for Tank #{tankId}</h1>
        <p className="text-gray-600">This page will display water test logs and charts.</p>
        {/* TODO: Add Water Test UI or import <WaterLogPage /> if it exists */}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
