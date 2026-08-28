import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://careeros.in"),
  title: {
    default: "Career OS — AI-Powered Career Readiness Platform for Students",
    template: "%s | Career OS",
  },
  description:
    "AI-Powered Career Preparation & Placement Readiness Platform. From Day 1 of graduation → skills → projects → profiles → practice → placement.",
  keywords: [
    "career readiness platform",
    "student career OS",
    "placement preparation",
    "AI career coach",
    "skill assessment",
    "mock interview practice",
    "coding practice",
    "resume builder",
    "internship tracker",
    "college placement",
  ],
  authors: [{ name: "Career OS" }],
  creator: "Career OS",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Career OS",
    title: "Career OS — AI-Powered Career Readiness Platform",
    description:
      "From Day 1 of graduation to placement. Assess skills, build projects, practice interviews, and track your career journey — all in one platform.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career OS — AI-Powered Career Readiness Platform",
    description:
      "From Day 1 of graduation to placement. Assess skills, build projects, practice interviews, and track your career journey.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  function isExtensionError(source){
    if (typeof source === "string" && source.indexOf("chrome-extension://") !== -1) return true;
    return false;
  }
  function guardError(e){
    var f = (e && (e.filename || (e.error && (e.error.stack || e.error.message)) || "")) || "";
    if (isExtensionError(f) && e.stopImmediatePropagation){ e.preventDefault && e.preventDefault(); e.stopImmediatePropagation(); }
  }
  function guardRejection(e){
    var f = (e && e.reason && (e.reason.stack || e.reason.message)) || "";
    if (isExtensionError(f) && e.stopImmediatePropagation){ e.preventDefault && e.preventDefault(); e.stopImmediatePropagation(); }
  }
  window.addEventListener("error", guardError, true);
  window.addEventListener("unhandledrejection", guardRejection, true);
})();`,
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
