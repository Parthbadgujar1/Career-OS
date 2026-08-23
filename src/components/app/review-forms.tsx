"use client";

import { useRef, useState } from "react";
import { reviewResumeAction, reviewProfileAction, buildResumeAction } from "@/server/actions/reviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";

function downloadResumePdf(studentName: string, role: string, content: string) {
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
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    if (line.startsWith("## ") || line.startsWith("### ")) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      y += 2;
      doc.text(line.replace(/#/g, "").trim(), 20, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      y += 6;
    } else if (line.startsWith("# ")) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      y += 4;
      doc.text(line.replace(/#/g, "").trim(), 20, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      y += 8;
    } else {
      doc.text(line, 20, y);
      y += 5;
    }
  }

  const fileName = `${studentName.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`;
  doc.save(fileName);
}

export function ResumeReviewForm({ defaultRole, studentName }: { defaultRole: string; studentName: string }) {
  const [result, setResult] = useState<{ atsScore: number; summary: string; content: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await reviewResumeAction(fd);
      if (res && "error" in res) {
        setError(res.error);
      } else if (res) {
        setResult({
          atsScore: res.atsScore,
          summary: res.summary,
          content: res.content || "",
        });
      }
    } catch (err) {
      console.error("[ResumeReviewForm] submit failed", err);
      setError("Something went wrong while submitting. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Resume Review</CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-indigo-600">{result.atsScore}/100</span>
              <Badge variant={result.atsScore >= 70 ? "success" : result.atsScore >= 40 ? "warning" : "danger"}>
                ATS Score
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{result.summary}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  formRef.current?.reset();
                }}
              >
                Review another resume
              </Button>
              <Button
                variant="gradient"
                onClick={() => downloadResumePdf(studentName, defaultRole, result.content)}
              >
                Download Resume PDF
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
              <Textarea
                id="resumeText"
                name="resumeText"
                rows={6}
                placeholder="Paste your resume text here for an ATS-oriented review..."
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Reviewing..." : "Review my resume"}
            </Button>
            <p className="text-xs text-slate-400">
              Upload a PDF to natively analyze layout and parse content using Gemini, or paste raw text.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function ResumeBuilderForm({ defaultRole, studentName }: { defaultRole: string; studentName: string }) {
  const [result, setResult] = useState<{ atsScore: number; summary: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({
    role: defaultRole,
    summary: "",
    education: "",
    projects: "",
    skills: "",
    achievements: "",
  });

  const preview = [
    fields.role && `Target role: ${fields.role}`,
    fields.summary && `SUMMARY\n${fields.summary}`,
    fields.education && `EDUCATION\n${fields.education}`,
    fields.skills && `SKILLS\n${fields.skills}`,
    fields.projects && `PROJECTS\n${fields.projects}`,
    fields.achievements && `ACHIEVEMENTS\n${fields.achievements}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await buildResumeAction(fd);
      if (res && "error" in res) setError(res.error);
      else if (res) setResult({ atsScore: res.atsScore, summary: res.summary });
    } catch (err) {
      console.error("[ResumeBuilderForm] submit failed", err);
      setError("Something went wrong while submitting. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const field = (key: keyof typeof fields, label: string, rows = 3, placeholder = "") => (
    <div>
      <Label htmlFor={`rb-${key}`}>{label}</Label>
      <Textarea
        id={`rb-${key}`}
        name={key}
        rows={rows}
        value={fields[key]}
        placeholder={placeholder}
        onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-indigo-600">{result.atsScore}/100</span>
              <Badge variant={result.atsScore >= 70 ? "success" : result.atsScore >= 40 ? "warning" : "danger"}>
                ATS Score
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{result.summary}</p>
            <p className="text-xs text-slate-400">
              Your resume was saved as a new version and reviewed. View it under Resume review history.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setFields({ role: defaultRole, summary: "", education: "", projects: "", skills: "", achievements: "" });
                }}
              >
                Build another resume
              </Button>
              <Button
                variant="gradient"
                onClick={() => downloadResumePdf(studentName, fields.role, preview)}
              >
                Download Resume PDF
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div>
              <Label htmlFor="rb-role">Target role</Label>
              <Input id="rb-role" name="role" value={fields.role} onChange={(e) => setFields((prev) => ({ ...prev, role: e.target.value }))} />
            </div>
            {field("summary", "Professional summary", 3, "One strong paragraph about your profile and goal.")}
            {field("education", "Education", 2, "Degree, college, year, CGPA/percentage.")}
            {field("skills", "Skills", 2, "Comma-separated skills relevant to your role.")}
            {field("projects", "Projects", 4, "One line per project: title, stack, what it does, your role.")}
            {field("achievements", "Achievements & certifications", 3, "Certifications, hackathons, competitions, awards.")}
            <div>
              <Label>Live preview</Label>
              <Textarea value={preview} readOnly rows={8} className="font-mono text-xs text-slate-600" />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Building & reviewing..." : "Build & review my resume"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileReviewForm() {
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await reviewProfileAction(fd);
      if (res && "error" in res) setError(res.error);
      else if (res) setResult({ score: res.score });
    } catch (err) {
      console.error("[ProfileReviewForm] submit failed", err);
      setError("Something went wrong while submitting. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LinkedIn / GitHub Review</CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-indigo-600">{result.score}/100</span>
              <Badge variant={result.score >= 70 ? "success" : result.score >= 40 ? "warning" : "danger"}>
                Profile score
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Review saved. Check the list below for findings and suggestions.
            </p>
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
              <Textarea
                id="details"
                name="details"
                rows={5}
                placeholder="Paste your headline, about section, or pinned repos if you want to override public fetching..."
              />
              <p className="text-xs text-slate-400 mt-1">
                Leave empty to automatically analyze based on your profile URL and Career OS skills/projects.
              </p>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Reviewing..." : "Review my profile"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
