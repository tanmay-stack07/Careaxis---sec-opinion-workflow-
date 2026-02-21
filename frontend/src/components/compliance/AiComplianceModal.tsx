import * as React from "react";
import { CheckCircle2, AlertTriangle, OctagonX } from "lucide-react";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import {
  demoGuidelines,
  demoMatchScore,
  demoSpecialistReferrals,
  demoStandardsComparison,
} from "./compliance-demo-data";
import type { ComplianceLevel } from "./compliance-types";

export type { ComplianceLevel } from "./compliance-types";

function levelLabel(level: ComplianceLevel) {
  switch (level) {
    case "minor":
      return "Minor";
    case "moderate":
      return "Moderate";
    case "severe":
      return "Severe";
  }
}

function levelBadgeClass(level: ComplianceLevel) {
  // Uses semantic token colors defined in index.css/tailwind.config.ts
  switch (level) {
    case "minor":
      return "border-transparent bg-compliance-minor text-compliance-minor-foreground";
    case "moderate":
      return "border-transparent bg-compliance-moderate text-compliance-moderate-foreground";
    case "severe":
      return "border-transparent bg-compliance-severe text-compliance-severe-foreground";
  }
}

function LevelIcon({ level }: { level: ComplianceLevel }) {
  const common = "h-12 w-12";

  if (level === "severe") {
    return <OctagonX className={`${common} text-compliance-severe`} aria-hidden="true" />;
  }

  if (level === "moderate") {
    return <AlertTriangle className={`${common} text-compliance-moderate`} aria-hidden="true" />;
  }

  return <CheckCircle2 className={`${common} text-compliance-minor`} aria-hidden="true" />;
}

function matchBadgeClass(match: "match" | "partial" | "mismatch") {
  if (match === "match") return "border-transparent bg-compliance-none text-compliance-none-foreground";
  if (match === "partial") return "border-transparent bg-compliance-minor text-compliance-minor-foreground";
  return "border-transparent bg-compliance-severe text-compliance-severe-foreground";
}

function urgencyBadgeClass(urgency: "Routine" | "Soon" | "Urgent") {
  if (urgency === "Routine") return "border-transparent bg-compliance-none text-compliance-none-foreground";
  if (urgency === "Soon") return "border-transparent bg-compliance-moderate text-compliance-moderate-foreground";
  return "border-transparent bg-compliance-severe text-compliance-severe-foreground";
}

export function AiComplianceModal({
  open,
  onOpenChange,
  level,
  onLevelChange,
  onProceed,
  onModify,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  level: ComplianceLevel;
  onLevelChange?: (v: ComplianceLevel) => void;
  onProceed: (payload: { justification?: string }) => void;
  onModify: () => void;
}) {
  const [justification, setJustification] = React.useState("");

  React.useEffect(() => {
    if (!open) setJustification("");
  }, [open]);

  const needsJustification = level === "severe";
  const justificationOk = !needsJustification || justification.trim().length >= 50;

  const matchScore = demoMatchScore(level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          "p-0 sm:max-w-[80vw] lg:max-w-[860px] " +
          "w-[100vw] h-[100dvh] max-w-none rounded-none sm:w-full sm:h-auto sm:rounded-lg"
        }
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="gap-3 border-b p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle style={{ fontFamily: "var(--font-display)" }}>AI Compliance Check Results</DialogTitle>
                <DialogDescription className="mt-1">
                  Industry standards comparison + risk signals for the current consultation (demo).
                </DialogDescription>
              </div>

              <Badge className={`shrink-0 ${levelBadgeClass(level)}`}>{levelLabel(level)}</Badge>
            </div>

            {onLevelChange ? (
              <div className="flex items-center justify-between gap-3 rounded-md border bg-background/50 px-3 py-2">
                <div className="text-xs text-muted-foreground">Demo mode</div>
                <div className="flex flex-wrap gap-2">
                  {(["minor", "moderate", "severe"] as const).map((v) => (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant={v === level ? "secondary" : "ghost"}
                      className="h-8"
                      onClick={() => onLevelChange(v)}
                    >
                      {levelLabel(v)}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4 sm:p-6">
              {/* Summary */}
              <div className="flex flex-col items-center gap-3 text-center">
                <LevelIcon level={level} />
                {level === "severe" ? (
                  <div className="space-y-1">
                    <div className="text-base font-semibold">Severe deviation detected — Justification Required</div>
                    <div className="text-sm text-muted-foreground">
                      Review issues, compare with standards, and document rationale.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-base font-semibold">{levelLabel(level)} deviations detected</div>
                    <div className="text-sm text-muted-foreground">
                      Compare the doctor’s suggestion with industry standards and confirm next steps.
                    </div>
                  </div>
                )}
              </div>

              {/* Standards + match */}
              <section className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">Industry standards & comparison</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Standards checked: {demoGuidelines.slice(0, 3).join(" • ")}
                    </div>
                  </div>

                  <div className="w-full max-w-[320px]">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">Match score</div>
                      <div className="text-sm font-semibold">{matchScore}%</div>
                    </div>
                    <Progress value={matchScore} className="mt-2" />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Demo score based on detected deviations; not a clinical verdict.
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {demoStandardsComparison[level].map((row) => (
                    <div key={row.id} className="rounded-md border bg-background/50 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="text-sm font-medium">Standards vs Doctor</div>
                        <Badge className={matchBadgeClass(row.match)}>
                          {row.match === "match" ? "Match" : row.match === "partial" ? "Partial" : "Mismatch"}
                        </Badge>
                      </div>
                      <div className="mt-2 grid gap-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Industry standard</div>
                          <div className="font-medium">{row.standard}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Doctor suggestion</div>
                          <div className="font-medium">{row.doctorSuggestion}</div>
                        </div>
                        {row.riskNote ? (
                          <div className="rounded-md border bg-background/60 p-2">
                            <div className="text-xs text-muted-foreground">Potential risk</div>
                            <div className="mt-0.5 text-sm font-medium">{row.riskNote}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>


              {/* Specialist referral */}
              <section className="rounded-lg border bg-card p-4">
                <div className="text-sm font-semibold">Specialist referral guidance</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Suggested specialties based on the risk signals (demo):
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {demoSpecialistReferrals[level].map((r) => (
                    <div key={r.id} className="rounded-md border bg-background/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{r.specialty}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{r.reason}</div>
                        </div>
                        <Badge className={urgencyBadgeClass(r.urgency)}>{r.urgency}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Justification (severe only) */}
              {level === "severe" ? (
                <section className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">Justification *</div>
                    <div className={`text-xs ${justificationOk ? "text-muted-foreground" : "text-destructive"}`}>
                      {justification.trim().length}/50
                    </div>
                  </div>
                  <Textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Document clinical justification (min 50 characters)..."
                    className="min-h-[110px]"
                  />
                  <div className="rounded-md border bg-background/60 p-3 text-sm">
                    <span className="font-medium text-foreground">Note:</span>{" "}
                    <span className="text-muted-foreground">This case will be flagged for admin review.</span>
                  </div>
                </section>
              ) : null}
            </div>
          </ScrollArea>

          <div className="border-t p-4 sm:p-6">
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                <div>Powered by RAG-Based AI Compliance Engine (demo)</div>
                <div>This is a decision support tool, not a diagnostic system.</div>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => {}}>
                  View Full Compliance Report
                </Button>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                {level === "severe" ? (
                  <Button
                    type="button"
                    className="h-10"
                    disabled={!justificationOk}
                    onClick={() => onProceed({ justification })}
                  >
                    Submit Justification & Finalize
                  </Button>
                ) : (
                  <Button type="button" className="h-10" onClick={() => onProceed({})}>
                    Acknowledge & Proceed
                  </Button>
                )}

                <Button type="button" variant="outline" className="h-10" onClick={onModify}>
                  Modify Consultation
                </Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
