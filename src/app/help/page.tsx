import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, BookOpen, MessageSquare, Search, Heart, Star, Zap } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does the readiness score work?",
      a: "Your readiness score (0-100) is calculated from 9 dimensions: technical skills, coding practice, assessments, projects, resume quality, profile strength, interview prep, opportunities engagement, and consistency. Each dimension contributes to your overall placement readiness.",
    },
    {
      q: "What is the career roadmap?",
      a: "The roadmap is a personalized 12-week plan generated based on your target role, current skills, and interests. It includes weekly milestones across learning, coding, projects, profile work, interviews, and opportunities. Complete milestones to progress.",
    },
    {
      q: "How do daily tasks work?",
      a: "Tasks are auto-generated each day based on your roadmap and skill gaps. Complete them to build streaks, earn XP, and improve your readiness. You can also skip tasks if they're not relevant.",
    },
    {
      q: "Can I use Career OS without an AI API key?",
      a: "Yes! All core features work with deterministic fallbacks. AI features (resume review, roadmap generation, profile analysis) use Gemini when GEMINI_API_KEY is set, otherwise they provide structured rule-based guidance.",
    },
    {
      q: "How do I get a mentor?",
      a: "Mentors are assigned by program admins. Once assigned, they can view your progress, skill gaps, and weekly reports. You'll see their contact info in the Mentor section and can message them directly.",
    },
    {
      q: "What are opportunities?",
      a: "Opportunities are internships, jobs, hackathons, and events sourced from platforms like Internshala, LinkedIn, Unstop, etc. They're matched to your profile. You can save, apply, or mark as completed.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="mt-2 text-slate-500">Find answers to common questions about Career OS</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {[
          { label: "Getting Started", icon: BookOpen },
          { label: "Roadmap & Tasks", icon: Zap },
          { label: "AI Features", icon: Star },
          { label: "Account", icon: Heart },
        ].map((cat) => (
          <Button key={cat.label} variant="outline" size="sm">
            <cat.icon className="h-4 w-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Card key={i} className="animate-fade-in-up overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{faq.q}</CardTitle>
                <Search className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-slate-600">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>Can&apos;t find what you&apos;re looking for?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <a href="mailto:support@carrer.com">
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/app/coach">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask AI Coach
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}