import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ProblemCard } from "@/components/app/problem-card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CodingPage() {
  const { profile } = await requireStudentProfile();

  const [problems, submissions] = await Promise.all([
    prisma.codingProblem.findMany({ orderBy: [{ difficulty: "asc" }, { createdAt: "desc" }] }),
    prisma.codingSubmission.findMany({
      where: { studentId: profile.id, status: "SOLVED" },
      select: { problemId: true },
    }),
  ]);

  const solvedIds = new Set(submissions.map((s) => s.problemId));
  const counts = {
    EASY: problems.filter((p) => p.difficulty === "EASY").length,
    MEDIUM: problems.filter((p) => p.difficulty === "MEDIUM").length,
    HARD: problems.filter((p) => p.difficulty === "HARD").length,
  };
  const solvedCount = solvedIds.size;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coding Practice</h1>
        <p className="text-sm text-slate-500">
          Core DSA problems mapped to common placement topics.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="success">{solvedCount} solved</Badge>
        <Badge variant="secondary">{counts.EASY} easy · {counts.MEDIUM} medium · {counts.HARD} hard</Badge>
      </div>

      <div className="space-y-3">
        {problems.map((p) => (
          <ProblemCard key={p.id} problem={p} solved={solvedIds.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
