import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTutorHistory,
  loadTutorHistory,
  saveTutorHistory,
} from "../tutor-storage";
import type { TutorChatMessage } from "../types";

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

describe("MLingo AI Tutor Storage", () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: memoryStorage,
      },
      writable: true,
      configurable: true,
    });
  });

  it("loads empty history when storage is empty", () => {
    const history = loadTutorHistory();
    expect(history).toEqual([]);
  });

  it("saves and reloads tutor chat messages accurately", () => {
    const messages: TutorChatMessage[] = [
      {
        id: "msg-1",
        role: "user",
        text: "Why did loss drop?",
        timestamp: 1000,
      },
      {
        id: "msg-2",
        role: "assistant",
        text: "Loss decreased because weights moved down the gradient.",
        timestamp: 1001,
        why: "Optimization stepped towards the minimum.",
        evidence: ["Loss: 0.1234"],
      },
    ];

    saveTutorHistory(messages);
    const loaded = loadTutorHistory();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].text).toBe("Why did loss drop?");
    expect(loaded[1].why).toBe("Optimization stepped towards the minimum.");
  });

  it("bounds history to the last 30 messages", () => {
    const manyMessages: TutorChatMessage[] = Array.from({ length: 45 }, (_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? "user" : "assistant",
      text: `Message ${i}`,
      timestamp: 1000 + i,
    }));

    saveTutorHistory(manyMessages);
    const loaded = loadTutorHistory();
    expect(loaded).toHaveLength(30);
    expect(loaded[0].id).toBe("msg-15");
    expect(loaded[29].id).toBe("msg-44");
  });

  it("handles corrupted or non-array JSON safely without crashing", () => {
    memoryStorage.setItem("mlingo-tutor-history", "{ \"corrupted\": true }");
    expect(loadTutorHistory()).toEqual([]);

    memoryStorage.setItem("mlingo-tutor-history", "not valid json at all");
    expect(loadTutorHistory()).toEqual([]);
  });

  it("filters out invalid message objects", () => {
    memoryStorage.setItem(
      "mlingo-tutor-history",
      JSON.stringify([
        { id: "valid-1", role: "user", text: "Hello" },
        { id: 123, role: "unknown" }, // invalid
        null,
        "string-item",
        { id: "valid-2", role: "assistant", text: "Hi there" },
      ])
    );

    const loaded = loadTutorHistory();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe("valid-1");
    expect(loaded[1].id).toBe("valid-2");
  });

  it("clears tutor history cleanly", () => {
    saveTutorHistory([
      { id: "msg-1", role: "user", text: "Test", timestamp: 1 },
    ]);
    expect(loadTutorHistory()).toHaveLength(1);

    clearTutorHistory();
    expect(loadTutorHistory()).toHaveLength(0);
  });
});
