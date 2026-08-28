"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("[GlobalError]", error);
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            An unexpected error occurred. This may be due to a temporary issue or a bug in the application.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400 break-all">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
