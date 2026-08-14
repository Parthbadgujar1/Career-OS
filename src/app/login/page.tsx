import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";

export const metadata = { title: "Log in | Student Career OS" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
