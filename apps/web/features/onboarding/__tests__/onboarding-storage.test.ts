import { beforeEach, describe, expect, it } from "vitest";
import {
  hasCompletedOnboarding,
  markOnboardingCompleted,
  resetOnboarding,
} from "../onboarding-storage";

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("Onboarding Storage & State Management", () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: memoryStorage,
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      writable: true,
      configurable: true,
    });
  });

  it("returns false initially when onboarding has not been completed", () => {
    expect(hasCompletedOnboarding()).toBe(false);
  });

  it("marks onboarding as completed in localStorage", () => {
    markOnboardingCompleted();
    expect(memoryStorage.getItem("mlingo-onboarding-completed")).toBe("true");
    expect(hasCompletedOnboarding()).toBe(true);
  });

  it("resets onboarding cleanly", () => {
    markOnboardingCompleted();
    expect(hasCompletedOnboarding()).toBe(true);

    resetOnboarding();
    expect(memoryStorage.getItem("mlingo-onboarding-completed")).toBeNull();
    expect(hasCompletedOnboarding()).toBe(false);
  });

  it("safely handles unexpected values in localStorage", () => {
    memoryStorage.setItem("mlingo-onboarding-completed", "invalid_value");
    expect(hasCompletedOnboarding()).toBe(false);
  });
});
