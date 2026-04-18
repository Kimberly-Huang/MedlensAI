export type AnalyzeResponse = {
  verdict: "SAFE" | "CAUTION" | "HIGH RISK";
  risk_score: number;
  confidence: number;
  short_summary: string;
  personalized_note: string;
  risk_flags: Array<{ title: string; severity: "low" | "medium" | "high"; reason: string }>;
  evidence_notes: Array<{ label: string; strength: "low" | "medium" | "high"; summary: string }>;
  suggested_next_steps: string[];
  sources: Array<{ title: string; url: string; source_type: "web" | "pubmed" | "regulatory"; summary: string }>;
  recall_signals: Array<{ title: string; status: string; summary: string; url?: string | null }>;
};

export type Profile = {
  allergies: string[];
  sensitivities: string[];
  dietary_preferences: string[];
  health_goals: string[];
  medications: string[];
  conditions: string[];
};
