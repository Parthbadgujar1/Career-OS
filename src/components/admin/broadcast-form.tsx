"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { broadcastNotificationAction } from "@/server/actions/admin";
import { Check, Megaphone, AlertCircle } from "lucide-react";

const initialState = { ok: false, sent: 0, error: undefined as string | undefined };

export function BroadcastForm() {
  const [state, formAction, isPending] = useActionState(broadcastNotificationAction, initialState);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Broadcast to All Students</CardTitle>
            <CardDescription>
              Every student receives this instantly in their Notifications and Overview
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="e.g. New Placement Drive — Apply Now" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" name="body" rows={4} placeholder="What should every student know?" />
          </div>
          {state.ok && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Sent to {state.sent} students.
            </p>
          )}
          {state.error && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-rose-600">
              <AlertCircle className="h-4 w-4" />
              {state.error}
            </p>
          )}
          <Button type="submit" variant="gradient" disabled={isPending} className="w-full">
            <Megaphone className="h-4 w-4 mr-2" />
            {isPending ? "Sending..." : "Broadcast Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
