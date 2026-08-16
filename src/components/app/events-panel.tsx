"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, ExternalLink, CheckCircle, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { registerEventAction } from "@/server/actions/activities";

export interface EventRow {
  id: string;
  title: string;
  type: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  url: string | null;
  registered: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  HACKATHON: "Hackathon",
  WEBINAR: "Webinar",
  WORKSHOP: "Workshop",
  CONTEST: "Contest",
  CAREER: "Career",
};

const TYPE_COLORS: Record<string, string> = {
  HACKATHON: "bg-purple-100 text-purple-700",
  WORKSHOP: "bg-blue-100 text-blue-700",
  WEBINAR: "bg-green-100 text-green-700",
  CAREER: "bg-indigo-100 text-indigo-700",
  CONTEST: "bg-orange-100 text-orange-700",
};

export function EventsPanel({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const register = (eventId: string) => {
    setPendingId(eventId);
    startTransition(async () => {
      await registerEventAction(eventId);
      setPendingId(null);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="animate-slide-in-up hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className={TYPE_COLORS[event.type] ?? "bg-slate-100 text-slate-700"}>
                  {TYPE_LABELS[event.type] ?? event.type}
                </Badge>
                <CardTitle className="mt-2">{event.title}</CardTitle>
              </div>
              {event.registered && <CheckCircle className="h-5 w-5 text-emerald-600 mt-1" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.description && (
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{event.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.startsAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {event.endsAt && (
                <span className="text-slate-400">
                  → {new Date(event.endsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{new Date(event.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {!event.endsAt && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>Online</span>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {event.registered ? (
                <Button variant="secondary" size="sm" className="flex-1" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registered
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => register(event.id)}
                >
                  {pendingId === event.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Register
                </Button>
              )}
              {event.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {events.length === 0 && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium">No events yet</h3>
            <p className="mt-1 text-sm text-slate-500">Check back soon for upcoming events</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
