"use client";

import { use } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/server/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordClient({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = use(searchParams);
  const token = params.token ?? "";
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <Card className="w-full max-w-md text-center animate-scale-in">
        <CardHeader><CardTitle>Invalid link</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">This password reset link is invalid.</p>
          <Button asChild variant="gradient" className="mt-4 w-full"><Link href="/forgot-password">Request a new link</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Enter a strong password (min 6 characters).</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="space-y-3 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="text-sm text-slate-600">Your password has been reset.</p>
            <Button asChild variant="gradient" className="w-full"><Link href="/login">Log in</Link></Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            {state?.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" variant="gradient" disabled={pending}>
              {pending ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
