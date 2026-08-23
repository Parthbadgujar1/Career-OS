import { generateAdminAiInsights, type AdminAnalyticsData } from "@/lib/ai/admin-insights";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, Activity, ArrowRight } from "lucide-react";

export async function AdminAiInsights({ metrics }: { metrics: AdminAnalyticsData }) {
  if (!process.env.GEMINI_API_KEY) {
    return (
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="pt-6 text-sm text-amber-800">
          AI analytics are currently unavailable. Configure your GEMINI_API_KEY to enable admin insights.
        </CardContent>
      </Card>
    );
  }

  let insights;
  try {
    insights = await generateAdminAiInsights(metrics);
  } catch (e) {
    console.error("[AdminAiInsights] Failed to generate AI insights", e);
    return (
      <Card className="border-rose-200 bg-rose-50/20 animate-fade-in-up">
        <CardContent className="pt-6 text-sm text-rose-800">
          Failed to generate AI analytics for the platform. Please refresh the page to retry.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-purple-100 bg-gradient-to-br from-purple-50/40 via-indigo-50/10 to-slate-50 shadow-sm animate-fade-in-up">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
      <CardHeader className="pb-3 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-1.5 text-purple-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                AI Platform Analytics & Health
              </CardTitle>
              <CardDescription>
                Aggregated student performance review and pipeline strategy
              </CardDescription>
            </div>
          </div>
          <Badge variant="gradient" className="from-purple-600 to-indigo-600">AI Consultant Active</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Platform Health Overview */}
        <div className="rounded-xl border border-purple-100 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 mb-1.5">
            <Activity className="h-3.5 w-3.5" />
            Platform Health Assessment
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {insights.healthAssessment}
          </p>
        </div>

        {/* Bottlenecks and Recommendations */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Identified Bottlenecks */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Identified Bottlenecks & Gaps
            </h3>
            <div className="space-y-3">
              {insights.bottlenecks.length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 text-center">
                  <p className="text-sm font-semibold text-emerald-800">No major bottlenecks detected in the pipeline! 🎉</p>
                </div>
              ) : (
                insights.bottlenecks.map((b, i) => (
                  <Link
                    key={i}
                    href="/admin#students"
                    className="block rounded-xl border border-amber-100 bg-white/55 p-3.5 space-y-2 hover:shadow-md hover:border-amber-200 transition-all group"
                  >
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      {b.area}
                      <ArrowRight className="h-3.5 w-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Impact:</span> {b.impact}
                    </p>
                    <p className="text-xs text-purple-800 bg-purple-50/40 border border-purple-100/50 rounded-lg px-2.5 py-1.5 leading-relaxed font-medium">
                      <span className="font-bold text-purple-900">Suggested Action:</span> {b.resolution}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Strategic Recommendations
            </h3>
            <div className="space-y-2.5">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-purple-100/60 bg-white/40 p-3 text-xs leading-relaxed text-slate-700 font-medium">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
