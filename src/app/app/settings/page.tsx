import { requireStudentProfile } from "@/lib/auth-helper";
import { SettingsPanel, type SettingsProfile } from "@/components/app/settings-panel";
import { fromJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, profile } = await requireStudentProfile();

  const initial: SettingsProfile = {
    name: user.name ?? "",
    email: user.email ?? "",
    degree: profile.degree ?? "",
    year: profile.year ?? "",
    targetRole: profile.targetRole ?? "",
    targetRoles: fromJson<string[]>(profile.targetRoles, []),
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    mobile: profile.mobile ?? "",
    city: profile.city ?? "",
    college: profile.college ?? "",
    preferences: fromJson<Record<string, boolean>>(profile.preferences, {}),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account, preferences, and data</p>
      </div>
      <SettingsPanel profile={initial} />
    </div>
  );
}
