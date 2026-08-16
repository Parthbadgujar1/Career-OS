"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("[AdminError]", error);
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
            <CardTitle className="text-xl">Admin Dashboard Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Failed to load admin dashboard data. This could be due to a database issue or permission error.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" asChild>
              <a href="/app">Go to Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
