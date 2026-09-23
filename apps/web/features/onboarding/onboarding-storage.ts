const ONBOARDING_STORAGE_KEY = "mlingo-onboarding-completed";

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true; // Default to true during SSR to prevent flash
  try {
    const val = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return val === "true";
  } catch {
    return true; // Graceful fallback if storage restricted
  }
}

export function markOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent("mlingo-onboarding-change", { detail: { completed: true } }));
  } catch {
    // Graceful fallback
  }
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("mlingo-onboarding-change", { detail: { completed: false } }));
  } catch {
    // Graceful fallback
  }
}
