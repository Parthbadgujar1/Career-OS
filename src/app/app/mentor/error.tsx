"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MentorError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("[MentorError]", error);
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
            <CardTitle className="text-xl">Mentor Dashboard Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Failed to load mentor dashboard. Please try again or contact your mentor.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400">Error ID: {error.digest}</p>
          )}
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
