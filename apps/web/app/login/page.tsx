import { Suspense } from "react";

import { LoginView } from "@/features/players/login-view";

export const metadata = { title: "Sign in · MLingo" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
