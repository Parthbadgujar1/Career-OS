import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { AssessmentQuiz } from "@/components/app/assessment-quiz";
import { getAssessmentSetsForProfile } from "@/lib/assessment-data";
import { fromJson } from "@/lib/utils";

export const metadata = { title: "Onboarding & Assessment | Student Career OS" };

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

  const taken = await prisma.assessment.findMany({ where: { studentId: profile.id } });
  const takenTypes = new Set(taken.map((a) => a.type));

  if (!profile.onboardedAt || step === "onboard") {
    // Change-path flow only: the profile previously had data, so allow cancel.
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
    const assessmentSets = getAssessmentSetsForProfile(profile.degree);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
          <h1 className="text-2xl font-bold">Skill grading test 📝</h1>
          <p className="mt-1 text-sm text-slate-600">
            No self-rating here — we measure your real level. Complete the quick tests below and
            every skill is graded 1–5 from your answers. Once done, your roadmap is rebuilt around
            exactly what you need to improve.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold">Baseline Assessment</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your skill grades and personalized roadmap are generated from these results.
          </p>
        </div>
        {assessmentSets.map((set) => (
          <AssessmentQuiz
            key={set.type}
            setType={set.type}
            title={set.title}
            description={set.description}
            questions={set.questions}
            alreadyTaken={takenTypes.has(set.type)}
            score={
              takenTypes.has(set.type)
                ? taken.find((a) => a.type === set.type)
                : undefined
            }
          />
        ))}
      </div>
    );
  }

  redirect("/app");
}
