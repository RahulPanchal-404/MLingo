import { beforeEach, describe, expect, it } from "vitest";
import { getPortfolioSummary } from "../portfolio-helpers";

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

describe("Portfolio Empty State Condition", () => {
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

  it("identifies empty state correctly when zero projects are completed", () => {
    const summary = getPortfolioSummary();
    expect(summary.completedProjects).toBe(0);
    expect(summary.inProgressProjects).toBe(0);
    // When completedProjects === 0, the portfolio displays the empty state callout
    const hasCompleted = summary.completedProjects > 0;
    expect(hasCompleted).toBe(false);
  });
});
