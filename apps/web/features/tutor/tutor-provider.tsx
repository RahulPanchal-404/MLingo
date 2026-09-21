"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  TutorChatMessage,
  TutorContext,
  TutorMessage,
  TutorRequest,
} from "./types";
import { askTutor } from "./tutor-api";
import { clearTutorHistory, loadTutorHistory, saveTutorHistory } from "./tutor-storage";
import { generateContextualSuggestions } from "./tutor-context-builder";

export type TutorContextValue = {
  isOpen: boolean;
  openTutor: (initialPrompt?: string) => void;
  closeTutor: () => void;
  toggleTutor: () => void;
  activeContext: TutorContext;
  setTutorContext: (
    update: Partial<TutorContext> | ((prev: TutorContext) => TutorContext)
  ) => void;
  messages: TutorChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  isLoading: boolean;
  suggestedPrompts: string[];
};

const TutorContextState = createContext<TutorContextValue | null>(null);

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContextState] = useState<TutorContext>({});
  const [messages, setMessages] = useState<TutorChatMessage[]>(() => loadTutorHistory());
  const [isLoading, setIsLoading] = useState(false);

  const setTutorContext = useCallback(
    (update: Partial<TutorContext> | ((prev: TutorContext) => TutorContext)) => {
      setActiveContextState((prev) => {
        if (typeof update === "function") {
          return update(prev);
        }
        return { ...prev, ...update };
      });
    },
    []
  );

  const clearMessages = useCallback(() => {
    clearTutorHistory();
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: TutorChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        text: trimmed,
        timestamp: Date.now(),
      };

      const updatedWithUser = [...messages, userMsg];
      setMessages(updatedWithUser);
      saveTutorHistory(updatedWithUser);
      setIsLoading(true);

      const historyForApi: TutorMessage[] = updatedWithUser.slice(-10).map((m) => ({
        role: m.role,
        content: m.text,
        anchors: m.anchors,
      }));

      const request: TutorRequest = {
        message: trimmed,
        context: activeContext,
        conversation_history: historyForApi,
      };

      try {
        const response = await askTutor(request);
        const assistantMsg: TutorChatMessage = {
          id: `asst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: "assistant",
          text: response.answer,
          timestamp: Date.now(),
          why: response.why,
          evidence: response.evidence,
          math_connection: response.math_connection,
          what_to_inspect_next: response.what_to_inspect_next,
          anchors: response.anchors,
          suggested_followups: response.suggested_followups,
          provider: response.provider,
        };

        const finalMessages = [...updatedWithUser, assistantMsg];
        setMessages(finalMessages);
        saveTutorHistory(finalMessages);
      } finally {
        setIsLoading(false);
      }
    },
    [activeContext, isLoading, messages]
  );

  const openTutor = useCallback(
    (initialPrompt?: string) => {
      setIsOpen(true);
      if (initialPrompt && initialPrompt.trim()) {
        void sendMessage(initialPrompt);
      }
    },
    [sendMessage]
  );

  const closeTutor = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleTutor = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const suggestedPrompts = useMemo(() => {
    return generateContextualSuggestions(activeContext);
  }, [activeContext]);

  const value = useMemo<TutorContextValue>(
    () => ({
      isOpen,
      openTutor,
      closeTutor,
      toggleTutor,
      activeContext,
      setTutorContext,
      messages,
      sendMessage,
      clearMessages,
      isLoading,
      suggestedPrompts,
    }),
    [
      isOpen,
      openTutor,
      closeTutor,
      toggleTutor,
      activeContext,
      setTutorContext,
      messages,
      sendMessage,
      clearMessages,
      isLoading,
      suggestedPrompts,
    ]
  );

  return (
    <TutorContextState.Provider value={value}>
      {children}
    </TutorContextState.Provider>
  );
}

export function useTutor(): TutorContextValue {
  const ctx = useContext(TutorContextState);
  if (!ctx) {
    throw new Error("useTutor must be used within a TutorProvider");
  }
  return ctx;
}
