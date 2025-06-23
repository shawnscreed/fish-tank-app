import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import TankDetail from "@/components/TankDetail";
import ClientLayout from "@/app/ClientLayout";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTUser {
  id: number;
  email: string;
  role: "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";
  name?: string;
}

export default async function TankPage() {
  const cookieStore = await cookies();
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

  return (
    <ClientLayout user={user}>
      <div className="p-6">
        <TankDetail userId={user.id} />
      </div>
    </ClientLayout>
  );
}
