import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-aurora blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-aurora blur-3xl animate-aurora" style={{ animationDelay: "-8s" }} />
      <div className="relative">
        <Suspense>
          <LoginForm showGoogle={googleEnabled} />
        </Suspense>
      </div>
    </main>
  );
}
