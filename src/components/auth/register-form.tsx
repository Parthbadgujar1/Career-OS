"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, null);
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    if (state && "success" in state && state.success && "redirectTo" in state) {
      router.push(state.redirectTo as string);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start from Day 1 — it only gets easier the earlier you begin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state && "error" in state && state.error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 animate-fade-in-up">{state.error}</p>
          )}
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@college.edu" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mobile">Mobile number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                required={role === "STUDENT"}
                inputMode="tel"
                pattern="[0-9+\-\s]{10,15}"
                title="Enter a valid mobile number (10–15 digits)"
                placeholder="9876543210"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required={role === "STUDENT"} placeholder="e.g. Hyderabad" />
            </div>
          </div>
          <div>
            <Label htmlFor="college">College name</Label>
            <Input id="college" name="college" required={role === "STUDENT"} placeholder="Your college / university" />
          </div>
          <div>
            <Label htmlFor="role">I am a</Label>
            <Select id="role" name="role" defaultValue="STUDENT" onChange={(e) => setRole(e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="MENTOR">Mentor</option>
            </Select>
          </div>
          <Button type="submit" className="w-full" variant="gradient" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
