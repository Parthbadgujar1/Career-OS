import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { MockInterviewForm } from "@/components/app/interview-form";
import { fromJson, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const { profile } = await requireStudentProfile();

  const interviews = await prisma.mockInterview.findMany({
    where: { studentId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  const total = interviews.length;
  const avg = interviews.length
    ? Math.round(
        (interviews.reduce((acc, i) => acc + (i.score ?? 0), 0) / interviews.reduce((acc, i) => acc + (i.maxScore ?? 1), 0)) * 100
      )
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mock Interviews</h1>
        <p className="text-sm text-slate-500">
          Log technical, HR and behavioral interviews and track your improvement.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{total} sessions</Badge>
        <Badge variant={avg >= 70 ? "success" : avg >= 40 ? "warning" : "danger"}>avg {avg}%</Badge>
      </div>

      <MockInterviewForm defaultRole={profile.targetRole ?? ""} />

      {interviews.length === 0 && (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No mock interviews yet. Log your first one above.
        </p>
      )}

      <div className="space-y-3">
        {interviews.map((i) => {
          const feedback = fromJson<string[]>(i.feedback, []);
          return (
            <Card key={i.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {i.type} interview{ i.role ? ` · ${i.role}` : ""}
                  </CardTitle>
                  <Badge variant={i.score && i.maxScore && i.score / i.maxScore >= 0.7 ? "success" : "secondary"}>
                    {i.score ?? "—"}/{i.maxScore ?? "—"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{formatDate(i.createdAt)}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {i.transcript && <p className="text-sm text-slate-600">{i.transcript}</p>}
                {feedback.length > 0 && (
                  <ul className="list-inside list-disc text-sm text-slate-500">
                    {feedback.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
