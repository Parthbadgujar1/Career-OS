import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { AdaptiveAssessment } from "@/components/app/adaptive-assessment";
import { fromJson } from "@/lib/utils";

export const metadata = { title: "Assessment | Student Career OS" };

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/app/assessment");

  const { step } = await searchParams;

  if (!profile.onboardedAt || step === "onboard") {
    const showBack = step === "onboard" && (profile.degree !== null || profile.targetRole !== null);
    return (
      <div className="mx-auto max-w-3xl">
        {showBack && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Changing your path?</span> Your current roadmap and
            profile stay intact until you save below — use{" "}
            <span className="font-semibold">Back to dashboard</span> to keep things as they are.
          </div>
        )}
        <OnboardingWizard
          existing={{
            degree: profile.degree ?? "",
            specialization: profile.specialization ?? "",
            year: profile.year ?? "",
            targetRole: profile.targetRole ?? "",
            targetRoles: fromJson<string[]>(profile.targetRoles, []),
            weeklyHours: profile.weeklyHours,
            interests: profile.interests,
            industries: profile.preferredIndustries,
          }}
          showBack={showBack}
        />
      </div>
    );
  }

  if (!profile.assessmentComplete) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
          <h1 className="text-2xl font-bold">AI Skill Assessment</h1>
          <p className="mt-1 text-sm text-slate-600">
            No self-rating here — the AI asks adaptive questions based on your chosen
            specialization and target role, then grades every skill (1-5) from your answers.
            Your personalized roadmap is built from the results.
          </p>
        </div>
        <AdaptiveAssessment />
      </div>
    );
  }

  redirect("/app");
}
