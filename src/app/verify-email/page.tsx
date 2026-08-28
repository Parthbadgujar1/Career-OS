import type { Metadata } from "next";
import VerifyEmailClient from "./client";

export const metadata: Metadata = { title: "Verify Email" };

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4">
      <VerifyEmailClient searchParams={searchParams} />
    </main>
  );
}
