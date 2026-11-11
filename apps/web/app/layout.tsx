import type { Metadata } from "next";
import { Gabarito, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { TutorProvider } from "@/features/tutor/tutor-provider";
import { TutorLauncher } from "@/features/tutor/components/tutor-launcher";
import { TutorDrawer } from "@/features/tutor/components/tutor-drawer";
import { OnboardingModal } from "@/features/onboarding/onboarding-modal";

import { ThemeProvider, ThemeScript } from "@/features/theme/theme-provider";
import { AuthProvider } from "@/features/players/auth-provider";

const body = Lexend({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Gabarito({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLingo: watch machine learning happen",
  description: "An interactive platform for learning machine learning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
          <TutorProvider>
            {children}
            <TutorLauncher />
            <TutorDrawer />
            <OnboardingModal />
          </TutorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


