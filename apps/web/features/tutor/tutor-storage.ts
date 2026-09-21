import type { TutorChatMessage } from "./types";

const TUTOR_STORAGE_KEY = "mlingo-tutor-history";

export function loadTutorHistory(): TutorChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TUTOR_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidChatMessage);
  } catch {
    return [];
  }
}

export function saveTutorHistory(messages: TutorChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep last 30 messages to bound localStorage usage
    const bounded = messages.slice(-30);
    window.localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(bounded));
  } catch {
    // Ignore quota errors safely
  }
}

export function clearTutorHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TUTOR_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

function isValidChatMessage(val: unknown): val is TutorChatMessage {
  if (!val || typeof val !== "object") return false;
  const v = val as Partial<TutorChatMessage>;
  return (
    typeof v.id === "string" &&
    (v.role === "user" || v.role === "assistant") &&
    typeof v.text === "string"
  );
}
