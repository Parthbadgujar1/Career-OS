import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ResumeReviewForm, ProfileReviewForm, ResumeBuilderForm } from "@/components/app/review-forms";
import { fromJson } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, CheckCircle2 } from "lucide-react";

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
        <ProfileReviewForm studentName={user.name || ""} />
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
            {resumes.slice(0, 5).map((r) => {
              const suggestions = fromJson<string[]>(r.review?.suggestions ?? "[]", []);
              const missingSkills = fromJson<string[]>(r.review?.missingSkills ?? "[]", []);
              const impactStatements = fromJson<string[]>(r.review?.impactStatements ?? "[]", []);
              return (
                <div key={r.id} className="rounded-lg border border-slate-100 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <p className="text-sm font-medium">Version {r.version}</p>
                      {r.role && <span className="text-xs text-slate-400">— {r.role}</span>}
                    </div>
                    <Badge variant={((r.review?.atsScore ?? 0) >= 70 ? "success" : (r.review?.atsScore ?? 0) >= 40 ? "warning" : "danger")}>
                      ATS {r.review?.atsScore ?? "—"}
                    </Badge>
                  </div>
                  {r.review?.summary && (
                    <p className="text-xs text-slate-600">{r.review.summary}</p>
                  )}
                  {missingSkills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Missing skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {missingSkills.slice(0, 5).map((s) => <Badge key={s} variant="danger" className="text-[10px]">{s}</Badge>)}
                      </div>
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Top suggestions</p>
                      <ul className="mt-1 space-y-0.5">
                        {suggestions.slice(0, 3).map((s) => (
                          <li key={s} className="text-xs text-slate-500 flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {impactStatements.length > 0 && (
                    <p className="text-[10px] text-indigo-500">{impactStatements.length} impact statement{suggestions.length !== 1 ? "s" : ""} rewritten</p>
                  )}
                </div>
              );
            })}
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
            {profileReviews.slice(0, 5).map((r) => {
              const suggestions = fromJson<string[]>(r.suggestions, []);
              const findings = fromJson<string[]>(r.findings, []);
              return (
                <div key={r.id} className="rounded-lg border border-slate-100 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.platform === "LINKEDIN" ? (
                        <span className="text-xs font-semibold text-blue-600">in</span>
                      ) : (
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      )}
                      <p className="text-sm font-medium">{r.platform === "LINKEDIN" ? "LinkedIn" : "GitHub"}</p>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:underline truncate max-w-[120px]">
                          {r.url.replace(/^https?:\/\//, "").slice(0, 30)}
                        </a>
                      )}
                    </div>
                    <Badge variant={r.score >= 70 ? "success" : r.score >= 40 ? "warning" : "danger"}>
                      Score {r.score}
                    </Badge>
                  </div>
                  {findings.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Findings</p>
                      <ul className="mt-1 space-y-0.5">
                        {findings.slice(0, 2).map((f) => (
                          <li key={f} className="text-xs text-slate-500 flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Top suggestions</p>
                      <ul className="mt-1 space-y-0.5">
                        {suggestions.slice(0, 3).map((s) => (
                          <li key={s} className="text-xs text-slate-500">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
