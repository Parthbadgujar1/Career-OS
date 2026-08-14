import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { QuizCard } from "@/components/app/quiz-card";
import { fromJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StoredQuestion = { q: string; options: string[]; answer: number };

export default async function QuizzesPage() {
  const { profile } = await requireStudentProfile();

  const quizzes = await prisma.quiz.findMany({ orderBy: { createdAt: "desc" } });
  const results = await prisma.quizResult.findMany({ where: { studentId: profile.id } });

  const resultByQuiz = new Map(results.map((r) => [r.quizId, r]));
  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const totalMax = results.reduce((acc, r) => acc + r.maxScore, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-sm text-slate-500">
            Refresh fundamentals across subjects. Each attempt updates your readiness.
          </p>
        </div>
        {totalMax > 0 && (
          <p className="text-sm text-slate-500">
            Overall: <span className="font-semibold text-indigo-600">{totalScore}/{totalMax}</span>
          </p>
        )}
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const questions = fromJson<StoredQuestion[]>(quiz.questions, []);
          const res = resultByQuiz.get(quiz.id);
          return (
            <QuizCard
              key={quiz.id}
              quiz={{ id: quiz.id, title: quiz.title, topic: quiz.topic, difficulty: quiz.difficulty, questions }}
              taken={!!res}
              lastScore={res?.score}
            />
          );
        })}
      </div>
    </div>
  );
}
