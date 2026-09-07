"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookInterviewSlotAction } from "@/server/actions/interviews";
import { formatInterviewType } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, CalendarDays, Loader2, User2, Clock, Users } from "lucide-react";

export interface SlotCard {
  id: string;
  title: string;
  type: string;
  startAt: string;
  mentor: { name: string | null } | null;
  maxStudents: number;
  _bookedCount?: number;
}

export function InterviewBooker({ slots, bookedIds }: { slots: SlotCard[]; bookedIds: Set<string> }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const book = async (slotId: string) => {
    setPendingId(slotId);
    setError(null);
    const res = await bookInterviewSlotAction(slotId);
    if ("error" in res) setError(res.error);
    setPendingId(null);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          Available mentor slots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {slots.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
            No live slots open right now. Check back soon — mentors publish slots daily.
          </p>
        )}
        {slots.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(s.startAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User2 className="h-3.5 w-3.5" />
                    {s.mentor?.name ?? "Mentor"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {s._bookedCount !== undefined ? Math.max(0, s.maxStudents - s._bookedCount) : s.maxStudents} seat{s.maxStudents > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <Badge variant="secondary">{formatInterviewType(s.type)}</Badge>
            </div>
            {bookedIds.has(s.id) ? (
              <div className="mt-2 text-xs font-semibold text-emerald-600">✓ Booked — find it under My Sessions</div>
            ) : (
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="default" onClick={() => book(s.id)} disabled={pendingId === s.id}>
                  {pendingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  Book slot
                </Button>
              </div>
            )}
          </div>
        ))}
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
