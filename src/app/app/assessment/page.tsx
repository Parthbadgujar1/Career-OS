import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { AssessmentQuiz } from "@/components/app/assessment-quiz";
import { ASSESSMENT_SETS } from "@/lib/assessment-data";

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
            weeklyHours: profile.weeklyHours,
            interests: profile.interests,
            industries: profile.preferredIndustries,
          }}
        />
      </div>
    );
  }

  if (!profile.assessmentComplete) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Baseline Assessment</h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete the three quick assessments. Your roadmap adapts to your results.
          </p>
        </div>
        {ASSESSMENT_SETS.map((set) => (
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
