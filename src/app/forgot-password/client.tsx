"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/server/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null);

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.success ? (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              If an account exists with that email, a reset link has been sent. Check your inbox.
            </div>
          ) : (
            <>
              {state?.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@college.edu" />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending..." : "Send reset link"}
              </Button>
            </>
          )}
          <p className="text-center text-sm text-slate-500">
            Remember your password? <Link href="/login" className="font-medium text-indigo-600 hover:underline">Back to login</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
