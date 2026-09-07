import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the Career OS platform.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
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
        <h1 className="font-serif text-3xl font-semibold text-slate-900 sm:text-4xl">Terms of Service</h1>
        <p className="text-sm text-slate-500">Last updated: August 2026</p>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Career OS (&quot;the Platform&quot;), you agree to these Terms of Service. If you do not agree, do not use the Platform.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">2. Eligibility</h2>
          <p>
            Career OS is designed for students pursuing higher education. By creating an account, you confirm you are a current student or recent graduate. You must be at least 16 years old to use the Platform.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">3. Account Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must provide accurate and complete information during registration</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>One account per person — duplicate accounts may be suspended</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">4. Platform Usage</h2>
          <p>
            Career OS provides AI-powered career preparation tools including skill assessments, project roadmaps, mock interviews, resume review, job matching, and career coaching. The AI-generated content is advisory in nature and should not be considered professional career counseling.
          </p>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Platform for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Automate data extraction or scraping from the Platform</li>
            <li>Share your account credentials with others</li>
            <li>Upload malicious content or code</li>
            <li>Misuse AI features (e.g., generating harmful content, bypassing rate limits)</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">5. Intellectual Property</h2>
          <p>
            The Platform, its design, code, and content (excluding user-generated content) are owned by Career OS. You retain ownership of content you create on the Platform (resumes, project descriptions, etc.) and grant us a limited license to process it for feature delivery.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">6. AI Disclaimer</h2>
          <p>
            AI-generated suggestions, assessments, and coaching are based on patterns in training data and should be treated as informational guidance. Career OS does not guarantee specific outcomes such as job placement, interview success, or skill improvement.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">7. Pricing and Payment</h2>
          <p>
            Career OS is currently free for individual students. We reserve the right to introduce paid features in the future with reasonable notice. Any pricing changes will be communicated in advance.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">8. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these Terms. You may delete your account at any time from Settings. Upon deletion, your data is removed within 30 days as described in our Privacy Policy.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">9. Limitation of Liability</h2>
          <p>
            Career OS is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">10. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">11. Contact</h2>
          <p>
            For questions about these Terms, contact: <a href="mailto:support@careeros.in" className="text-violet-600 hover:underline">support@careeros.in</a>
          </p>
        </section>
      </main>
    </div>
  );
}
