import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ResumeReviewForm, ProfileReviewForm, ResumeBuilderForm } from "@/components/app/review-forms";
import { fromJson } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const { user, profile } = await requireStudentProfile();

  const [resumes, profileReviews] = await Promise.all([
    prisma.resume.findMany({
      where: { studentId: profile.id },
      include: { review: true },
      orderBy: { version: "desc" },
    }),
    prisma.profileReview.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resume & Professional Profiles</h1>
        <p className="text-sm text-slate-500">
          ATS-oriented resume review and LinkedIn/GitHub positioning checks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ResumeBuilderForm defaultRole={profile.targetRole ?? ""} studentName={user.name || ""} />
        </div>
        <ResumeReviewForm defaultRole={profile.targetRole ?? ""} studentName={user.name || ""} />
        <ProfileReviewForm />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resume review history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resumes.length === 0 && (
              <p className="text-sm text-slate-500">No resume reviews yet.</p>
            )}
            {resumes.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Version {r.version}</p>
                  <Badge variant="secondary">ATS {r.review?.atsScore ?? "—"}</Badge>
                </div>
                {r.review && (
                  <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
                    {fromJson<string[]>(r.review.suggestions, [])
                      .slice(0, 3)
                      .map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile review history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileReviews.length === 0 && (
              <p className="text-sm text-slate-500">No profile reviews yet.</p>
            )}
            {profileReviews.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.platform}</p>
                  <Badge variant="secondary">Score {r.score}</Badge>
                </div>
                <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
                  {fromJson<string[]>(r.suggestions, [])
                    .slice(0, 3)
                    .map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
