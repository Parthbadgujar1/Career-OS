import type { Metadata } from "next";
import ForgotPasswordForm from "./client";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4">
      <ForgotPasswordForm />
    </main>
  );
}
