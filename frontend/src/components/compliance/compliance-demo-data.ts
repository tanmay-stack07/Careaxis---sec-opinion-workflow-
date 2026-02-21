import type { ComplianceLevel, DeviationItem, SpecialistReferralItem, StandardsComparisonItem } from "./compliance-types";

export const demoGuidelines = [
  "ICMR Standard Treatment Guidelines (STG)",
  "WHO Clinical Guidelines (Adult)",
  "Local Antibiotic Stewardship Protocol",
];

export const demoDeviations: Record<ComplianceLevel, DeviationItem[]> = {
  minor: [
    {
      id: "minor-1",
      issue: "Dose timing may be suboptimal for reported symptoms.",
      guideline: "ICMR STG • Fever management",
      recommendation: "Consider after-food dosing if gastritis risk is present.",
    },
    {
      id: "minor-2",
      issue: "Follow-up interval could be shortened given borderline vitals.",
      guideline: "WHO • Primary care follow-up",
      recommendation: "Recheck within 48–72 hours if symptoms persist.",
    },
  ],
  moderate: [
    {
      id: "mod-1",
      issue: "Medication choice may not align with first-line options for suspected diagnosis.",
      guideline: "Local Stewardship • First-line selection",
      recommendation: "Evaluate alternative first-line therapy before finalizing.",
    },
    {
      id: "mod-2",
      issue: "Investigation set may be incomplete for differential diagnosis.",
      guideline: "ICMR STG • Workup",
      recommendation: "Consider CBC + Urine routine based on complaints.",
    },
  ],
  severe: [
    {
      id: "sev-1",
      issue: "Potential high-risk interaction / contraindication flagged.",
      guideline: "WHO • Safety checks",
      risk: "May increase adverse event risk; requires documented clinical justification.",
    },
    {
      id: "sev-2",
      issue: "Deviation from escalation criteria based on oxygen saturation threshold.",
      guideline: "ICMR STG • Respiratory red flags",
      risk: "Delayed escalation can increase morbidity; justification required.",
    },
  ],
};

export function demoMatchScore(level: ComplianceLevel) {
  // UI-only heuristic (demo)
  if (level === "minor") return 86;
  if (level === "moderate") return 68;
  return 42;
}

export const demoStandardsComparison: Record<ComplianceLevel, StandardsComparisonItem[]> = {
  minor: [
    {
      id: "cmp-1",
      standard: "Antipyretic dosing aligned with weight and gastric tolerance.",
      doctorSuggestion: "Paracetamol, standard dose; consider timing with food.",
      match: "partial",
      riskNote: "Low risk; mainly comfort/tolerance.",
    },
    {
      id: "cmp-2",
      standard: "Follow-up within 48–72h if symptoms persist.",
      doctorSuggestion: "Follow-up in 5–7 days unless worsening.",
      match: "partial",
      riskNote: "May delay reassessment.",
    },
  ],
  moderate: [
    {
      id: "cmp-1",
      standard: "First-line therapy before broad-spectrum alternatives.",
      doctorSuggestion: "Consider broader coverage based on local pattern.",
      match: "partial",
      riskNote: "Moderate risk of overtreatment / resistance.",
    },
    {
      id: "cmp-2",
      standard: "Baseline labs if differential includes infection/UTI.",
      doctorSuggestion: "No labs ordered.",
      match: "mismatch",
      riskNote: "Could miss alternate diagnosis.",
    },
  ],
  severe: [
    {
      id: "cmp-1",
      standard: "Avoid contraindicated combinations; document alternative rationale.",
      doctorSuggestion: "Proceed with combination due to prior response.",
      match: "mismatch",
      riskNote: "Higher risk of adverse event; requires justification.",
    },
    {
      id: "cmp-2",
      standard: "Escalate/referral when SpO₂ below threshold.",
      doctorSuggestion: "Home observation.",
      match: "mismatch",
      riskNote: "Potential delayed escalation.",
    },
  ],
};

export const demoSpecialistReferrals: Record<ComplianceLevel, SpecialistReferralItem[]> = {
  minor: [
    {
      id: "ref-1",
      specialty: "General Medicine",
      urgency: "Routine",
      reason: "No red flags—routine follow-up if symptoms persist.",
    },
  ],
  moderate: [
    {
      id: "ref-1",
      specialty: "Internal Medicine",
      urgency: "Soon",
      reason: "Moderate deviations—review diagnosis/workup and optimize therapy.",
    },
    {
      id: "ref-2",
      specialty: "Clinical Pharmacology",
      urgency: "Routine",
      reason: "Medication selection review if multiple comorbidities/meds.",
    },
  ],
  severe: [
    {
      id: "ref-1",
      specialty: "Emergency Medicine",
      urgency: "Urgent",
      reason: "Severe safety/escalation deviation flagged—urgent clinical assessment advised.",
    },
    {
      id: "ref-2",
      specialty: "Pulmonology",
      urgency: "Soon",
      reason: "If respiratory red flags persist (e.g., low SpO₂), specialist evaluation recommended.",
    },
  ],
};
