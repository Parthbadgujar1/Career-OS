"use client";

import { useRef, useState } from "react";
import { reviewResumeAction, reviewProfileAction, buildResumeAction, generateImprovedResumeAction, generateImprovedProfileAction } from "@/server/actions/reviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

function downloadResumePdf(studentName: string, role: string, content: string, prefix = "") {
  const doc = new jsPDF();
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text(studentName || "Resume", 20, 20);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105);
  doc.text(role || "Candidate", 20, 28);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const splitText = doc.splitTextToSize(content || "", 170);
  let y = 40;
  const pageHeight = doc.internal.pageSize.height;
  for (const line of splitText) {
    if (y > pageHeight - 20) { doc.addPage(); y = 20; }
    if (line.startsWith("## ") || line.startsWith("### ")) {
      doc.setFont("Helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(30, 41, 59); y += 2;
      doc.text(line.replace(/#/g, "").trim(), 20, y);
      doc.setFont("Helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(51, 65, 85); y += 6;
    } else if (line.startsWith("# ")) {
      doc.setFont("Helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(30, 41, 59); y += 4;
      doc.text(line.replace(/#/g, "").trim(), 20, y);
      doc.setFont("Helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(51, 65, 85); y += 8;
    } else { doc.text(line, 20, y); y += 5; }
  }
  doc.save(`${prefix}${studentName.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`);
}

function downloadProfileContent(studentName: string, platform: string, content: string) {
  const doc = new jsPDF();
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(`${platform} Profile — ${studentName}`, 20, 20);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const splitText = doc.splitTextToSize(content || "", 170);
  let y = 35;
  const pageHeight = doc.internal.pageSize.height;
  for (const line of splitText) {
    if (y > pageHeight - 20) { doc.addPage(); y = 20; }
    if (line.endsWith(":")) {
      doc.setFont("Helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59); y += 3;
      doc.text(line, 20, y); doc.setFont("Helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(51, 65, 85); y += 6;
    } else { doc.text(line, 20, y); y += 5; }
  }
  doc.save(`${studentName.toLowerCase().replace(/\s+/g, "_")}_${platform.toLowerCase()}_profile.pdf`);
}

function SectionStatus({ status, note }: { status: string; note: string }) {
  const icon = status === "STRONG" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    : status === "WEAK" ? <AlertTriangle className="h-4 w-4 text-amber-500" />
    : <XCircle className="h-4 w-4 text-rose-500" />;
  const color = status === "STRONG" ? "border-emerald-100 bg-emerald-50/50"
    : status === "WEAK" ? "border-amber-100 bg-amber-50/50"
    : "border-rose-100 bg-rose-50/50";
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-2.5 ${color}`}>
      {icon}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-700">{status}</p>
        <p className="text-xs text-slate-500">{note}</p>
      </div>
    </div>
  );
}

// ── Resume Review Form ────────────────────────────────────────────────────

export function ResumeReviewForm({ defaultRole, studentName }: { defaultRole: string; studentName: string }) {
  const [result, setResult] = useState<{
    atsScore: number; summary: string; content: string;
    missingSkills: string[]; suggestions: string[]; impactStatements: string[];
    sectionAnalysis: Array<{ section: string; status: string; note: string }>;
    keywordGaps: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImproved, setShowImproved] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);
  const [improvedChanges, setImprovedChanges] = useState<string[]>([]);
  const [improving, setImproving] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await reviewResumeAction(fd);
      if (res && "error" in res) setError(res.error);
      else if (res) setResult(res);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setPending(false); }
  }

  async function handleImprove() {
    if (!result) return;
    setImproving(true);
    try {
      const res = await generateImprovedResumeAction("current");
      if (res && "ok" in res) {
        setImprovedContent(res.improvedContent);
        setImprovedChanges(res.changesSummary);
        setShowImproved(true);
      }
    } catch { /* ignore */ }
    setImproving(false);
  }

  const reset = () => { setResult(null); setImprovedContent(null); setShowImproved(false); formRef.current?.reset(); };

  return (
    <Card>
      <CardHeader><CardTitle>AI Resume Review</CardTitle></CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-5">
            {/* Score */}
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-700">{result.atsScore}</p>
                <p className="text-xs text-slate-500">/100</p>
              </div>
              <div className="flex-1">
                <Badge variant={result.atsScore >= 70 ? "success" : result.atsScore >= 40 ? "warning" : "danger"}>
                  ATS Score
                </Badge>
                <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
              </div>
            </div>

            {/* Section Analysis */}
            {result.sectionAnalysis.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Section Analysis</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.sectionAnalysis.map((s) => (
                    <SectionStatus key={s.section} status={s.status} note={`${s.section}: ${s.note}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Missing Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => <Badge key={s} variant="danger">{s}</Badge>)}
                </div>
              </div>
            )}

            {/* Keyword Gaps */}
            {result.keywordGaps.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">ATS Keyword Gaps</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordGaps.map((k) => <Badge key={k} variant="warning">{k}</Badge>)}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Action Items</h3>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Statements */}
            {result.impactStatements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Rewritten Impact Statements</h3>
                <div className="space-y-2">
                  {result.impactStatements.map((s, i) => (
                    <div key={i} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5">
                      <p className="text-xs text-slate-700 italic">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improved Preview */}
            {showImproved && improvedContent && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                    <Sparkles className="h-4 w-4" />
                    AI-Improved Resume
                  </h3>
                  <button onClick={() => setShowOriginal(!showOriginal)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                    {showOriginal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showOriginal ? "Show improved" : "Show original"}
                  </button>
                </div>
                {improvedChanges.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Changes made:</p>
                    <ul className="text-xs text-slate-500 space-y-0.5">
                      {improvedChanges.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>
                )}
                <Textarea
                  value={showOriginal ? result.content : improvedContent}
                  readOnly
                  rows={12}
                  className="font-mono text-xs text-slate-700 bg-white"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={reset}>Review another resume</Button>
              {!showImproved && (
                <Button variant="gradient" onClick={handleImprove} disabled={improving}>
                  {improving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {improving ? "Generating improved version..." : "Generate Improved Resume"}
                </Button>
              )}
              {showImproved && improvedContent && (
                <Button variant="gradient" onClick={() => downloadResumePdf(studentName, defaultRole, improvedContent, "improved_")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Improved PDF
                </Button>
              )}
              <Button variant="outline" onClick={() => downloadResumePdf(studentName, defaultRole, result.content)}>
                <Download className="h-4 w-4 mr-2" />
                Download Original
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div>
              <Label htmlFor="role">Target role</Label>
              <Input id="role" name="role" defaultValue={defaultRole} />
            </div>
            <div>
              <Label htmlFor="resumeFile">Upload resume PDF</Label>
              <Input id="resumeFile" name="resumeFile" type="file" accept="application/pdf" className="cursor-pointer" />
            </div>
            <div>
              <Label htmlFor="resumeText">Or paste your resume content</Label>
              <Textarea id="resumeText" name="resumeText" rows={6} placeholder="Paste your resume text here for an ATS-oriented review..." />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Reviewing..." : "Review my resume"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ── Resume Builder Form ───────────────────────────────────────────────────

export function ResumeBuilderForm({ defaultRole, studentName }: { defaultRole: string; studentName: string }) {
  const [result, setResult] = useState<{
    atsScore: number; summary: string; missingSkills: string[];
    suggestions: string[]; impactStatements: string[];
    sectionAnalysis: Array<{ section: string; status: string; note: string }>;
    keywordGaps: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImproved, setShowImproved] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);
  const [improvedChanges, setImprovedChanges] = useState<string[]>([]);
  const [improving, setImproving] = useState(false);
  const [fields, setFields] = useState({ role: defaultRole, summary: "", education: "", projects: "", skills: "", achievements: "" });

  const preview = [
    fields.role && `Target role: ${fields.role}`,
    fields.summary && `SUMMARY\n${fields.summary}`,
    fields.education && `EDUCATION\n${fields.education}`,
    fields.skills && `SKILLS\n${fields.skills}`,
    fields.projects && `PROJECTS\n${fields.projects}`,
    fields.achievements && `ACHIEVEMENTS\n${fields.achievements}`,
  ].filter(Boolean).join("\n\n");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setPending(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await buildResumeAction(fd);
      if (res && "error" in res) setError(res.error);
      else if (res) {
        const reviewRes = await reviewResumeAction(fd);
        if (reviewRes && "ok" in reviewRes) setResult(reviewRes);
        else setResult({ atsScore: res.atsScore, summary: res.summary, missingSkills: [], suggestions: [], impactStatements: [], sectionAnalysis: [], keywordGaps: [] });
      }
    } catch { setError("Something went wrong."); }
    finally { setPending(false); }
  }

  async function handleImprove() {
    setImproving(true);
    try {
      const res = await generateImprovedResumeAction("current");
      if (res && "ok" in res) { setImprovedContent(res.improvedContent); setImprovedChanges(res.changesSummary); setShowImproved(true); }
    } catch { /* ignore */ }
    setImproving(false);
  }

  const field = (key: keyof typeof fields, label: string, rows = 3, placeholder = "") => (
    <div>
      <Label htmlFor={`rb-${key}`}>{label}</Label>
      <Textarea id={`rb-${key}`} name={key} rows={rows} value={fields[key]} placeholder={placeholder}
        onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))} />
    </div>
  );

  return (
    <Card>
      <CardHeader><CardTitle>Resume Builder</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-700">{result.atsScore}</p>
                <p className="text-xs text-slate-500">/100</p>
              </div>
              <div className="flex-1">
                <Badge variant={result.atsScore >= 70 ? "success" : result.atsScore >= 40 ? "warning" : "danger"}>ATS Score</Badge>
                <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
              </div>
            </div>

            {result.sectionAnalysis.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Section Analysis</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.sectionAnalysis.map((s) => <SectionStatus key={s.section} status={s.status} note={`${s.section}: ${s.note}`} />)}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Missing Skills</h3>
                <div className="flex flex-wrap gap-1.5">{result.missingSkills.map((s) => <Badge key={s} variant="danger">{s}</Badge>)}</div>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Action Items</h3>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showImproved && improvedContent && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <Sparkles className="h-4 w-4" />AI-Improved Resume
                </h3>
                {improvedChanges.length > 0 && (
                  <ul className="text-xs text-slate-500 space-y-0.5">{improvedChanges.map((c, i) => <li key={i}>• {c}</li>)}</ul>
                )}
                <Textarea value={improvedContent} readOnly rows={12} className="font-mono text-xs text-slate-700 bg-white" />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setResult(null); setFields({ role: defaultRole, summary: "", education: "", projects: "", skills: "", achievements: "" }); setImprovedContent(null); setShowImproved(false); }}>
                Build another resume
              </Button>
              {!showImproved && (
                <Button variant="gradient" onClick={handleImprove} disabled={improving}>
                  {improving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Improved Resume
                </Button>
              )}
              {showImproved && improvedContent && (
                <Button variant="gradient" onClick={() => downloadResumePdf(studentName, fields.role, improvedContent, "improved_")}>
                  <Download className="h-4 w-4 mr-2" />Download Improved PDF
                </Button>
              )}
              <Button variant="outline" onClick={() => downloadResumePdf(studentName, fields.role, preview)}>
                <Download className="h-4 w-4 mr-2" />Download Current
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div><Label htmlFor="rb-role">Target role</Label>
              <Input id="rb-role" name="role" value={fields.role} onChange={(e) => setFields((prev) => ({ ...prev, role: e.target.value }))} /></div>
            {field("summary", "Professional summary", 3, "One strong paragraph about your profile and goal.")}
            {field("education", "Education", 2, "Degree, college, year, CGPA/percentage.")}
            {field("skills", "Skills", 2, "Comma-separated skills relevant to your role.")}
            {field("projects", "Projects", 4, "One line per project: title, stack, what it does, your role.")}
            {field("achievements", "Achievements & certifications", 3, "Certifications, hackathons, competitions, awards.")}
            <div><Label>Live preview</Label>
              <Textarea value={preview} readOnly rows={8} className="font-mono text-xs text-slate-600" /></div>
            <Button type="submit" disabled={pending}>{pending ? "Building & reviewing..." : "Build & review my resume"}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ── Profile Review Form ───────────────────────────────────────────────────

export function ProfileReviewForm({ studentName }: { studentName: string }) {
  const [result, setResult] = useState<{
    score: number; summary: string; findings: string[]; suggestions: string[];
    sectionAnalysis: Array<{ section: string; status: string; note: string }>;
    whatToAdd: Array<{ item: string; priority: string; reason: string }>;
    platform: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImproved, setShowImproved] = useState(false);
  const [improvedData, setImprovedData] = useState<{
    headline: string; about: string; skillsToAdd: string[];
    projectsSection: string; readmeContent: string; changesSummary: string[];
  } | null>(null);
  const [improving, setImproving] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("LINKEDIN");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setPending(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      setSelectedPlatform((fd.get("platform") as string) || "LINKEDIN");
      const res = await reviewProfileAction(fd);
      if (res && "error" in res) setError(res.error);
      else if (res) setResult({ ...res, platform: (fd.get("platform") as string) || "LINKEDIN" });
    } catch { setError("Something went wrong."); }
    finally { setPending(false); }
  }

  async function handleImprove() {
    setImproving(true);
    try {
      const res = await generateImprovedProfileAction(selectedPlatform as "LINKEDIN" | "GITHUB");
      if (res && "ok" in res) { setImprovedData(res); setShowImproved(true); }
    } catch { /* ignore */ }
    setImproving(false);
  }

  const downloadProfile = () => {
    if (!improvedData) return;
    const content = [
      `HEADLINE:\n${improvedData.headline}`,
      `ABOUT:\n${improvedData.about}`,
      `SKILLS TO ADD:\n${improvedData.skillsToAdd.join(", ")}`,
      `PROJECTS:\n${improvedData.projectsSection}`,
      selectedPlatform === "GITHUB" ? `README:\n${improvedData.readmeContent}` : "",
    ].filter(Boolean).join("\n\n");
    downloadProfileContent(studentName, selectedPlatform, content);
  };

  return (
    <Card>
      <CardHeader><CardTitle>LinkedIn / GitHub Review</CardTitle></CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-700">{result.score}</p>
                <p className="text-xs text-slate-500">/100</p>
              </div>
              <div className="flex-1">
                <Badge variant={result.score >= 70 ? "success" : result.score >= 40 ? "warning" : "danger"}>Profile Score</Badge>
                <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
              </div>
            </div>

            {result.sectionAnalysis.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Section Analysis</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.sectionAnalysis.map((s) => <SectionStatus key={s.section} status={s.status} note={`${s.section}: ${s.note}`} />)}
                </div>
              </div>
            )}

            {result.findings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Findings</h3>
                <ul className="space-y-1.5">
                  {result.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.whatToAdd.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">What to Add</h3>
                <div className="space-y-2">
                  {result.whatToAdd.map((a, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-2.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={a.priority === "HIGH" ? "danger" : a.priority === "MEDIUM" ? "warning" : "secondary"} className="text-[10px]">{a.priority}</Badge>
                        <p className="text-xs font-medium text-slate-700">{a.item}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{a.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Action Items</h3>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showImproved && improvedData && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <Sparkles className="h-4 w-4" />AI-Improved {selectedPlatform} Content
                </h3>
                {improvedData.changesSummary.length > 0 && (
                  <ul className="text-xs text-slate-500 space-y-0.5">{improvedData.changesSummary.map((c, i) => <li key={i}>• {c}</li>)}</ul>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Improved Headline</p>
                    <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-sm text-slate-700">{improvedData.headline}</div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Improved About</p>
                    <Textarea value={improvedData.about} readOnly rows={6} className="text-xs text-slate-700 bg-white" />
                  </div>
                  {improvedData.skillsToAdd.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Skills to Add</p>
                      <div className="flex flex-wrap gap-1.5">{improvedData.skillsToAdd.map((s) => <Badge key={s} variant="indigo">{s}</Badge>)}</div>
                    </div>
                  )}
                  {improvedData.projectsSection && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Projects Section</p>
                      <Textarea value={improvedData.projectsSection} readOnly rows={5} className="text-xs text-slate-700 bg-white" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setResult(null); setImprovedData(null); setShowImproved(false); }}>Review another profile</Button>
              {!showImproved && (
                <Button variant="gradient" onClick={handleImprove} disabled={improving}>
                  {improving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Improved Profile
                </Button>
              )}
              {showImproved && improvedData && (
                <Button variant="gradient" onClick={downloadProfile}>
                  <Download className="h-4 w-4 mr-2" />Download Improved Profile
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select id="platform" name="platform" defaultValue="LINKEDIN">
                <option value="LINKEDIN">LinkedIn</option>
                <option value="GITHUB">GitHub</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">Profile URL</Label>
              <Input id="url" name="url" type="url" placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="details">Additional profile details (Optional)</Label>
              <Textarea id="details" name="details" rows={5} placeholder="Paste your headline, about section, or pinned repos if you want to override public fetching..." />
              <p className="text-xs text-slate-400 mt-1">Leave empty to automatically analyze based on your profile URL and Career OS data.</p>
            </div>
            <Button type="submit" disabled={pending}>{pending ? "Reviewing..." : "Review my profile"}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
