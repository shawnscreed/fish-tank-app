// 📄 File: src/app/work/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions"; // ✅ fixed import
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import WorkPage from "@/components/WorkPage";
import { redirect } from "next/navigation";
import { JWTUser } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user: JWTUser = {
    id: Number(session.user.id),
    email: session.user.email!,
    name: session.user.name || "",
    role: session.user.role as JWTUser["role"],
  };

  return (
    <ClientLayoutWrapper user={user}>
      <WorkPage userId={user.id} />
    </ClientLayoutWrapper>
  );
}
