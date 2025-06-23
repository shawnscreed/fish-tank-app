// app/dashboard/tank/[id]/water/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import ClientLayout from "@/app/ClientLayout";
import WaterLogPage from "@/components/WaterLogPage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTUser {
  id: number;
  email: string;
  role: "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";
  name?: string;
}

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = await cookies(); // ✅ Await here
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let user: JWTUser;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    user = payload as unknown as JWTUser;
  } catch (err) {
    console.error("JWT verification failed", err);
    redirect("/login");
  }

  const tankId = Number(params.id);

  return (
    <ClientLayout user={user}>
      <WaterLogPage userId={user.id} tankId={tankId} />
    </ClientLayout>
  );
}
