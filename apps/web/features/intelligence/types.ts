import type { DiagnosticType } from "@/features/diagnostics/types";

export type LearningEvidenceItem = {
  label: string;
  value: string;
  step?: number;
};

export type LearningIntelligenceExplanation = {
  id: string;
  diagnosticId: string;
  type: DiagnosticType;
  title: string;
  step: number;
  whatHappened: string;
  evidence: LearningEvidenceItem[];
  why: string;
  parameterBehavior: string;
  suggestedAction: string;
  relatedConcepts: string[];
  mathAnchorId?: string;
  codeAnchorId?: string;
  modelXRayAnchorId?: string;
};
