import { redirect } from "next/navigation";
import Link from "next/link";
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
    const skills = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
    const studentSkills = await prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true },
    });
    return (
      <div className="mx-auto max-w-3xl">
        <OnboardingWizard
          skills={skills.map((s) => ({ id: s.id, name: s.name, category: s.category }))}
          existingRatings={Object.fromEntries(
            studentSkills.map((ss) => [ss.skillId, ss.selfRating])
          )}
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
        />
      </div>
    );
  }

  if (!profile.assessmentComplete) {
    const assessmentSets = getAssessmentSetsForProfile(profile.degree);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
          <h1 className="text-2xl font-bold">You&apos;re all set up 🎉</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your personalized roadmap is ready. Test your baseline knowledge with the quick
            assessments below, or skip straight to your dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Skip — go to dashboard
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold">Baseline Assessment</h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete the quick assessments below. Your roadmap adapts to your results.
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
