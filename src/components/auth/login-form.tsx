"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [state, formAction, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state && "success" in state && state.success && "redirectTo" in state) {
      router.push(state.redirectTo as string);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Continue your career journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {state && "error" in state && state.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 animate-fade-in-up">{state.error}</p>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@college.edu" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" variant="gradient" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Demo accounts: <br />
            Student — student@carrer.com / student123
            <br />
            Admin — admin@carrer.com / admin123
            <br />
            Mentor — mentor@carrer.com / mentor123
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
