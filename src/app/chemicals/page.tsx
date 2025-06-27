// 📄 File: src/app/chemicals/page.tsx
import MainContainer from "@/components/MainContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import ChemicalsClient from "@/components/ChemicalsClient";
import { JWTUser } from "@/lib/auth";

export default async function ChemicalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.warn("❌ No session, redirecting");
    redirect("/login");
  }

  const { id, name, email, role } = session.user as any;

  // 🔒 Restrict to admin or super_admin
  if (role !== "admin" && role !== "super_admin") {
    console.warn("🔒 Unauthorized access by role:", role);
    redirect("/unauthorized");
  }

  const currentUser: JWTUser = {
    id: Number(id),
    name,
    email,
    role,
  };

  return (
    <ClientLayoutWrapper user={currentUser}>
      <ChemicalsClient />
    </ClientLayoutWrapper>
  );
}
