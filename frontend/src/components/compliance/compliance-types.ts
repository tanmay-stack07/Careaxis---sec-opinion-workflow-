export type ComplianceLevel = "minor" | "moderate" | "severe";

export type DeviationItem = {
  id: string;
  issue: string;
  guideline: string;
  recommendation?: string;
  risk?: string;
};

export type StandardsComparisonItem = {
  id: string;
  standard: string;
  doctorSuggestion: string;
  match: "match" | "partial" | "mismatch";
  riskNote?: string;
};

export type SpecialistReferralItem = {
  id: string;
  specialty: string;
  urgency: "Routine" | "Soon" | "Urgent";
  reason: string;
};
