import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TutorProvider } from "@/features/tutor/tutor-provider";
import { TutorLauncher } from "@/features/tutor/components/tutor-launcher";
import { TutorDrawer } from "@/features/tutor/components/tutor-drawer";
import { OnboardingModal } from "@/features/onboarding/onboarding-modal";

import { ThemeProvider, ThemeScript } from "@/features/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLingo — Machine Learning, Frame by Frame",
  description: "An interactive platform for learning machine learning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full transition-colors duration-200">
        <ThemeProvider>
          <TutorProvider>
            {children}
            <TutorLauncher />
            <TutorDrawer />
            <OnboardingModal />
          </TutorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


