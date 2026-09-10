export type DiagnosticType =
      | "rapid_loss_decrease"
      | "possible_plateau"
      | "possible_instability"
      | "possible_divergence"
      | "near_convergence";

export type DiagnosticSeverity = "info" | "warning" | "success";

export type DiagnosticEvidence = Record<string, number | string | number[]>;

export type DiagnosticEvent = {
      id: string;
      step: number;
      type: DiagnosticType;
      title: string;
      description: string;
      severity: DiagnosticSeverity;
      evidence: DiagnosticEvidence;
};