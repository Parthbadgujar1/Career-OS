import type { Metadata } from "next";
import ForgotPasswordForm from "./client";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-aurora blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-aurora blur-3xl animate-aurora" style={{ animationDelay: "-8s" }} />
      <ForgotPasswordForm />
    </main>
  );
}
