import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-slate-50">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href="/app">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
