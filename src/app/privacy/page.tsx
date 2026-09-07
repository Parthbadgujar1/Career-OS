import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Career OS collects, uses, and protects your personal data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
            Career <span className="text-violet-600">OS</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <h1 className="font-serif text-3xl font-semibold text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: August 2026</p>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            Career OS collects information you provide directly: your name, email address, college name, degree, career interests, skills self-assessments, resume content, and activity data (tasks completed, projects, interview scores). We also collect account information through Google OAuth when you sign in with Google.
          </p>
          <p>
            We automatically collect usage data such as pages visited, features used, and interaction patterns to improve the platform.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide personalized career guidance, adaptive task recommendations, and AI coaching</li>
            <li>To generate skill assessments, mock interview feedback, and weekly progress reports</li>
            <li>To match you with relevant job and internship opportunities</li>
            <li>To improve the platform and develop new features</li>
            <li>To communicate important updates about your account or the platform</li>
            <li>To provide mentor and college administrator dashboards for institutional users</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">3. AI Processing</h2>
          <p>
            Career OS uses third-party AI providers (Google Gemini, Groq, OpenAI) to process your data for features like career coaching, resume review, and skill assessment. Your data is sent to these providers only when you actively use AI-powered features. We do not use your data to train AI models.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">4. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>College administrators and mentors at your institution (for placement tracking)</li>
            <li>AI service providers solely for feature processing (Gemini, Groq, OpenAI, Resend for email)</li>
            <li>When required by law or to protect the safety of our users</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">5. Data Security</h2>
          <p>
            We use industry-standard encryption (HTTPS/TLS) and secure authentication. Your password is hashed using bcrypt. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">6. Data Retention</h2>
          <p>
            Your account and data are retained as long as your account is active. You may delete your account at any time from Settings. Deleted accounts and associated data are permanently removed within 30 days.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">7. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You may export your data at any time. To exercise these rights, contact us at the email below.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be notified via email or in-app notification.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">9. Contact</h2>
          <p>
            For privacy-related questions, contact: <a href="mailto:privacy@careeros.in" className="text-violet-600 hover:underline">privacy@careeros.in</a>
          </p>
        </section>
      </main>
    </div>
  );
}
