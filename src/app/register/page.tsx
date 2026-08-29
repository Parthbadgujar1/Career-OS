import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RegisterForm from "@/components/auth/register-form";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/app");

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-aurora blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-aurora blur-3xl animate-aurora" style={{ animationDelay: "-8s" }} />
      <div className="relative">
        <RegisterForm />
      </div>
    </main>
  );
}