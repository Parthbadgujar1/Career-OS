import { generateMentorAiInsights, type CohortStudentData } from "@/lib/ai/mentor-insights";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, BookOpen, CheckSquare, Users, ArrowRight } from "lucide-react";
import { MentorChecklist } from "./mentor-checklist";

export async function MentorAiInsights({ students }: { students: CohortStudentData[] }) {
  if (!process.env.GEMINI_API_KEY) {
    return (
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="pt-6 text-sm text-amber-800">
          AI insights are currently unavailable. Configure your GEMINI_API_KEY to enable mentor insights.
        </CardContent>
      </Card>
    );
  }

  let insights;
  try {
    insights = await generateMentorAiInsights(students);
  } catch (e) {
    console.error("[MentorAiInsights] Failed to generate AI insights", e);
    return (
      <Card className="border-rose-200 bg-rose-50/20 animate-fade-in-up">
        <CardContent className="pt-6 text-sm text-rose-800">
          Failed to generate AI insights for your cohort. Please refresh the page to retry.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-indigo-100 bg-indigo-50 shadow-sm animate-fade-in-up">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-amber-400" />
      <CardHeader className="pb-3 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-indigo-100 p-1.5 text-indigo-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                AI Cohort Performance Advisor
              </CardTitle>
              <CardDescription>
                Real-time predictive analysis of your {students.length} mentees
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-violet-600 text-white border-violet-600">Powered by Gemini</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="rounded-xl border border-indigo-100 bg-surface/70 backdrop-blur-sm p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1.5">
            <Users className="h-3.5 w-3.5" />
            Cohort Executive Summary
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {insights.summary}
          </p>
        </div>

        {/* Priority Focus & Skill Gaps Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Students Needing Attention */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Priority Mentees (Attention Required)
            </h3>
            <div className="space-y-3">
              {insights.needsAttention.length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 text-center">
                  <p className="text-sm font-semibold text-emerald-800">All students are currently on track! 🎉</p>
                </div>
              ) : (
                insights.needsAttention.map((s, i) => (
                  <Link
                    key={i}
                    href="/mentor#mentees"
                    className="block rounded-xl border border-rose-100 bg-surface/55 p-3.5 space-y-2 hover:shadow-md hover:border-rose-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {s.name}
                        <ArrowRight className="h-3.5 w-3.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <Badge variant="danger" className="text-[10px]">Action Required</Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Issue:</span> {s.reason}
                    </p>
                    <p className="text-xs text-indigo-800 bg-indigo-50/40 border border-indigo-100/50 rounded-lg px-2.5 py-1.5 leading-relaxed font-medium">
                      <span className="font-bold text-indigo-900">Mentor Tip:</span> {s.actionableTip}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Common Gaps & Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Top Shared Skill Gaps
            </h3>
            <div className="space-y-3">
              {insights.commonGaps.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                  <p className="text-sm text-slate-500">No major common gaps detected across this cohort.</p>
                </div>
              ) : (
                insights.commonGaps.map((g, i) => (
                  <Link
                    key={i}
                    href="/mentor/skills"
                    className="block rounded-xl border border-indigo-100/60 bg-surface/55 p-3.5 space-y-2 hover:shadow-md hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {g.skill}
                        <ArrowRight className="h-3.5 w-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {g.studentCount} student{g.studentCount > 1 ? "s" : ""} affected
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <span className="font-bold text-slate-700">Action Plan:</span> {g.recommendedResource}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actionable Recommendations Checklist */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" />
            Mentor Action Items Checklist
          </h3>
          <MentorChecklist items={insights.recommendations} />
        </div>
      </CardContent>
    </Card>
  );
}
