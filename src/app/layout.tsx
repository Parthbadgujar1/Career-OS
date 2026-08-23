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
  title: "Student Career OS",
  description:
    "AI-Powered Career Preparation & Placement Readiness Platform. From Day 1 of graduation → skills → projects → profiles → practice → placement.",
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
        {children}
      </body>
    </html>
  );
}
