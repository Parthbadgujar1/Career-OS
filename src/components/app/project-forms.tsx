"use client";

import { useState } from "react";
import { createProjectWithAIAction, suggestProjectDetailsAction } from "@/server/actions/project-ai";
import { recommendProjectsAction } from "@/server/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle2, Lightbulb, FileText } from "lucide-react";

export function CreateProjectForm() {
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [aiResult, setAiResult] = useState<{
    suggestedTechStack: string[];
    description: string;
    features: string[];
    improvements: string[];
    resumeBlurb: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getSuggestions = async () => {
    if (!title) return;
    setAiLoading(true);
    try {
      const result = await suggestProjectDetailsAction(title, description);
      if (result && "suggestedTechStack" in result) {
        setAiResult(result);
        setTechStack(result.suggestedTechStack.join(", "));
        if (!description && result.description) {
          setDescription(result.description);
        }
      }
    } catch {
      // silently fail
    }
    setAiLoading(false);
  };

  const submitProject = async () => {
    setPending(true);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("techStack", techStack);
    if (aiResult?.resumeBlurb) fd.set("resumeBlurb", aiResult.resumeBlurb);
    await createProjectWithAIAction(fd);
    setPending(false);
    setTitle("");
    setDescription("");
    setTechStack("");
    setAiResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="title">Project title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Sales Dashboard, Weather App, E-commerce Site"
          />
        </div>
        <div>
          <Label htmlFor="description">What does it do?</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe your project idea..."
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="techStack">Tech stack</Label>
            <Input
              id="techStack"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, Node.js, MongoDB (or let AI suggest)"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={getSuggestions}
            disabled={!title || aiLoading}
            className="shrink-0"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Suggest
          </Button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiResult && (
        <Card className="border-indigo-100 bg-indigo-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-semibold text-indigo-700">AI Suggestions</p>
            </div>

            {aiResult.suggestedTechStack.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Suggested Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.suggestedTechStack.map((t) => (
                    <Badge key={t} variant="indigo">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {aiResult.features.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  <Lightbulb className="inline h-3 w-3 mr-1" />
                  Key Features to Build
                </p>
                <ul className="text-xs text-slate-600 space-y-1">
                  {aiResult.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiResult.improvements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">How to Stand Out</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  {aiResult.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-500">•</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiResult.resumeBlurb && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
                <p className="text-xs font-medium text-emerald-700 mb-0.5">
                  <FileText className="inline h-3 w-3 mr-1" />
                  Resume Bullet Point
                </p>
                <p className="text-xs text-slate-700 italic">{aiResult.resumeBlurb}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button onClick={submitProject} disabled={pending || !title} className="w-full">
        {pending ? "Adding..." : "Add project"}
      </Button>
    </div>
  );
}

export function RecommendButton() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      action={async () => {
        setPending(true);
        const res = await recommendProjectsAction();
        if (res && "ok" in res) setMsg(`Added ${res.count} AI-recommended projects below.`);
        setPending(false);
      }}
    >
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Generating..." : "Get AI project recommendations"}
      </Button>
      {msg && <p className="mt-2 text-xs text-emerald-600">{msg}</p>}
    </form>
  );
}
