"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, LogOut, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Label } from "@/components/ui/input";
import { updateProfileAction } from "@/server/actions/profile";
import { updatePreferencesAction } from "@/server/actions/profile";
import { deleteAccountAction } from "@/server/actions/account";
import { signOutAction } from "@/server/actions/session";
import {
  DEGREES,
  CAREER_ROLES_BY_DEGREE,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface SettingsProfile {
  name: string;
  email: string;
  degree: string;
  year: string;
  targetRole: string;
  targetRoles: string[];
  githubUrl: string;
  linkedinUrl: string;
  mobile: string;
  city: string;
  college: string;
  preferences?: Record<string, boolean>;
}

const NOTIFICATIONS = [
  { key: "taskReminders", label: "Daily Task Reminders", desc: "Get reminded about your daily tasks at 9 AM" },
  { key: "weeklyReport", label: "Weekly Progress Report", desc: "Receive your weekly summary every Sunday" },
  { key: "opportunityAlerts", label: "New Opportunity Alerts", desc: "Get notified when matching opportunities are posted" },
  { key: "eventReminders", label: "Event Reminders", desc: "Reminders for registered events 1 hour before start" },
  { key: "mentorMessages", label: "Mentor Messages", desc: "Notifications when your mentor sends feedback" },
];

const PRIVACY = [
  { key: "profileVisibility", label: "Profile Visibility", desc: "Allow mentors and admins to view your profile" },
  { key: "leaderboards", label: "Show in Leaderboards", desc: "Appear in weekly readiness leaderboards" },
  { key: "shareWithMentor", label: "Share Progress with Mentor", desc: "Automatically share weekly reports with your mentor" },
];

export function SettingsPanel({ profile }: { profile: SettingsProfile }) {
  const router = useRouter();
  const [form, setForm] = useState<SettingsProfile>(() =>
    profile.targetRoles.length > 0
      ? profile
      : { ...profile, targetRoles: profile.targetRole ? [profile.targetRole] : [] }
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>(profile.preferences ?? {});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggle = (key: string) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    setSavingKey(key);
    startTransition(async () => {
      await updatePreferencesAction(key, next[key]);
      setSavingKey(null);
    });
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("degree", form.degree);
    fd.set("year", form.year);
    fd.set("targetRoles", JSON.stringify(form.targetRoles));
    fd.set("targetRole", form.targetRoles[0] ?? "");
    fd.set("githubUrl", form.githubUrl);
    fd.set("linkedinUrl", form.linkedinUrl);
    fd.set("mobile", form.mobile);
    fd.set("city", form.city);
    fd.set("college", form.college);
    startTransition(async () => {
      const result = await updateProfileAction(fd);
      if ("ok" in result) {
        setStatus("Profile saved — synced to Overview, mentor, and admin dashboards.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const changeDegree = (next: string) => {
    const nextRoles = (CAREER_ROLES_BY_DEGREE[next as keyof typeof CAREER_ROLES_BY_DEGREE] ?? []) as string[];
    setForm((prev) => ({
      ...prev,
      degree: next,
      targetRoles: prev.targetRoles.filter((r) => nextRoles.includes(r)),
    }));
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role],
    }));
  };

  const roleOptions = (CAREER_ROLES_BY_DEGREE[form.degree as keyof typeof CAREER_ROLES_BY_DEGREE] ?? []) as string[];

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAccountAction();
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Synced across the student, mentor, and admin dashboards</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile}>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} disabled />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="9876543210"
                    pattern="[0-9+\-\s]{10,15}"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Your city"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="Your college name"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="degree">Degree</Label>
                  <Select id="degree" value={form.degree} onChange={(e) => changeDegree(e.target.value)}>
                    <option value="">Select degree</option>
                    {DEGREES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year">Year</Label>
                  <Select id="year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select year</option>
                    {["1st Year", "2nd Year", "3rd Year", "Final Year"].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Target career roles (pick any)</Label>
                {form.degree ? (
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          form.targetRoles.includes(r)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Select a degree first to see matching roles.</p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              {status && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  {status}
                </p>
              )}
              {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what Career OS reminds you about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {NOTIFICATIONS.map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!toggles[n.key]}
                  onChange={() => toggle(n.key)}
                  disabled={savingKey !== null}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                {savingKey === n.key && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
                <div>
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-slate-500">{n.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">Saved to your account — syncs across devices.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>Control what others can see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PRIVACY.map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{p.label}</p>
                  <p className="text-sm text-slate-500">{p.desc}</p>
                </div>
                {savingKey === p.key && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
                <input
                  type="checkbox"
                  checked={!!toggles[p.key]}
                  onChange={() => toggle(p.key)}
                  disabled={savingKey !== null}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">Saved to your account — syncs across devices.</p>
          <form action={signOutAction}>
            <Button variant="outline" className="w-full justify-start text-rose-600 hover:bg-rose-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out of all sessions
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-700">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-rose-700">Delete Account</p>
              <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
            </div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={isPending}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Confirm delete
                </Button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Delete Account
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-slate-500">Download all your data as JSON</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/api/export" target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
