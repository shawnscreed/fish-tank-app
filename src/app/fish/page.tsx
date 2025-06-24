import { getUserFromCookies } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ClientLayout from "../ClientLayout";
import FishTableClient from "@/app/fish/FishTableClient";


export default async function FishPage() {
  const user = await getUserFromCookies();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Block non-admins
  }

  return (
    <ClientLayout>
      <FishTableClient />
    </ClientLayout>
  );
}
