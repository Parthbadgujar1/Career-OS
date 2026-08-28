"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { getAllApplicantsAction, updateApplicantStatusAction } from "@/server/actions/employer";
import { useEffect } from "react";
import { CalendarDays } from "lucide-react";

const STATUS_OPTIONS = ["RECEIVED", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

const STATUS_BADGE: Record<string, "default" | "secondary" | "success" | "warning" | "danger" | "outline"> = {
  RECEIVED: "outline",
  SHORTLISTED: "warning",
  INTERVIEW: "default",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "danger",
};

interface Applicant {
  id: string;
  studentName: string;
  studentEmail: string;
  jobTitle: string;
  status: string;
  createdAt: string;
}

export default function EmployerApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getAllApplicantsAction().then((data) => {
      setApplicants(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    setUpdatingId(applicantId);
    await updateApplicantStatusAction(applicantId, newStatus);
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
    );
    setUpdatingId(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="text-sm text-slate-500">Review and manage candidates across all your job listings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applicants ({applicants.length})</CardTitle>
          <CardDescription>Change status to move candidates through the hiring pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-slate-500">Loading applicants...</p>}
          {!loading && applicants.length === 0 && (
            <p className="text-sm text-slate-500">No applicants yet.</p>
          )}
          {applicants.map((applicant) => (
            <div
              key={applicant.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{applicant.studentName}</p>
                  <Badge variant={STATUS_BADGE[applicant.status] ?? "secondary"}>
                    {applicant.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{applicant.studentEmail}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span>{applicant.jobTitle}</span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(applicant.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={applicant.status}
                  onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                  disabled={updatingId === applicant.id}
                  className="w-40"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
                {updatingId === applicant.id && (
                  <Button variant="ghost" size="sm" disabled>
                    Saving...
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
