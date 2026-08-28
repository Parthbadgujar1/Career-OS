"use client";

import { useState, useTransition } from "react";
import { aiEnhanceProjectAction } from "@/server/actions/project-ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, X, CheckCircle2, Lightbulb, FileText } from "lucide-react";

export function AiEnhanceButton({ projectId }: { projectId: string }) {
  const [showPanel, setShowPanel] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof aiEnhanceProjectAction>> | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEnhance = () => {
    setShowPanel(true);
    if (result) return;
    startTransition(async () => {
      const res = await aiEnhanceProjectAction(projectId);
      setResult(res);
    });
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={handleEnhance} disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 mr-1" />
        )}
        AI Enhance
      </Button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto animate-scale-in">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800">AI Project Enhancement</h3>
                </div>
                <button onClick={() => setShowPanel(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {isPending && !result && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="mt-3 text-sm text-slate-600">AI is analyzing your project...</p>
                </div>
              )}

              {result && "error" in result && (
                <p className="text-sm text-rose-600">{result.error}</p>
              )}

              {result && "suggestedTechStack" in result && (
                <>
                  {result.suggestedTechStack.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Suggested Tech Stack</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.suggestedTechStack.map((t) => (
                          <Badge key={t} variant="indigo">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.features.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        <Lightbulb className="inline h-3 w-3 mr-1" />
                        Key Features to Build
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {result.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">How to Stand Out</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {result.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-500">•</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.resumeBlurb && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
                      <p className="text-xs font-medium text-emerald-700 mb-0.5">
                        <FileText className="inline h-3 w-3 mr-1" />
                        Resume Bullet Point
                      </p>
                      <p className="text-xs text-slate-700 italic">{result.resumeBlurb}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
