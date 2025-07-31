import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return session;
}

export async function requireAdmin() {
  const session = await getServerSession();

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
