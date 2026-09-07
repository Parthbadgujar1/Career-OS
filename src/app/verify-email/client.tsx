"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { verifyEmailAction } from "@/server/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailClient({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = use(searchParams);
  const token = params.token ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "err">(!token ? "err" : "loading");

  useEffect(() => {
    if (!token) return;
    verifyEmailAction(token).then((r) => setStatus(r.success ? "ok" : "err"));
  }, [token]);

  return (
    <Card className="w-full max-w-md text-center animate-scale-in">
      <CardHeader className="items-center">
        {status === "loading" && <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />}
        {status === "ok" && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
        {status === "err" && <XCircle className="h-12 w-12 text-rose-500" />}
        <CardTitle className="mt-2">
          {status === "loading" && "Verifying your email..."}
          {status === "ok" && "Email verified!"}
          {status === "err" && "Verification failed"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "ok" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Your email is confirmed. You now have full access to all features.</p>
            <Button asChild className="w-full"><Link href="/app">Open Dashboard</Link></Button>
          </div>
        )}
        {status === "err" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">This verification link is invalid or has expired. Check your inbox for a fresh link.</p>
            <Button asChild className="w-full"><Link href="/login">Back to Login</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
