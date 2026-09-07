import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
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
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetBrainsMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <meta name="theme-color" content="#fafafb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0f" media="(prefers-color-scheme: dark)" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
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
