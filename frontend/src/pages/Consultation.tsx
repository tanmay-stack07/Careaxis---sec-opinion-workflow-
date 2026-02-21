import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import careAxisLogo from "@/assets/careaxis-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  analyzeVisit,
  getApiErrorMessage,
  getPatients,
  type AnalyzeVisitResponse,
  type PatientSummary,
} from "@/lib/api";
import { getAuthToken, getAuthUser } from "@/lib/demo-auth";

type VitalsState = {
  bpSys: string;
  bpDia: string;
  tempC: string;
  pulse: string;
  spo2: string;
  weightKg: string;
};

const defaultVitals: VitalsState = {
  bpSys: "120",
  bpDia: "80",
  tempC: "37",
  pulse: "78",
  spo2: "98",
  weightKg: "",
};

export default function Consultation() {
  const navigate = useNavigate();
  const token = getAuthToken() ?? undefined;
  const authUser = getAuthUser();

  const [patients, setPatients] = React.useState<PatientSummary[]>([]);
  const [loadingPatients, setLoadingPatients] = React.useState(false);

  const [selectedPatientId, setSelectedPatientId] = React.useState("");
  const [symptomInput, setSymptomInput] = React.useState("");
  const [symptoms, setSymptoms] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState("2-3 days");
  const [severity, setSeverity] = React.useState("high");
  const [vitals, setVitals] = React.useState<VitalsState>(defaultVitals);
  const [doctorDiagnosis, setDoctorDiagnosis] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<AnalyzeVisitResponse | null>(null);

  const loadPatients = React.useCallback(async () => {
    setLoadingPatients(true);
    try {
      const response = await getPatients(token);
      setPatients(response.patients);
      setSelectedPatientId((current) => current || response.patients[0]?.id || "");
    } catch (error) {
      toast.error("Failed to load patients", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoadingPatients(false);
    }
  }, [token]);

  React.useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null;

  const addSymptom = () => {
    const value = symptomInput.trim();
    if (!value) return;
    if (symptoms.includes(value)) {
      toast.message("Symptom already added");
      return;
    }
    setSymptoms((prev) => [...prev, value]);
    setSymptomInput("");
  };

  const removeSymptom = (index: number) => {
    setSymptoms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId) {
      toast.error("Please select a patient");
      return;
    }

    if (!authUser?.id) {
      toast.error("No doctor session found", {
        description: "Please login again.",
      });
      navigate("/", { replace: true });
      return;
    }

    if (!symptoms.length) {
      toast.error("Add at least one symptom");
      return;
    }

    if (!doctorDiagnosis.trim()) {
      toast.error("Doctor diagnosis is required");
      return;
    }

    const payload = {
      symptoms,
      duration,
      severity,
      vitals: {
        blood_pressure: {
          systolic: Number(vitals.bpSys) || null,
          diastolic: Number(vitals.bpDia) || null,
        },
        temperature_c: Number(vitals.tempC) || null,
        pulse: Number(vitals.pulse) || null,
        spo2: Number(vitals.spo2) || null,
        weight_kg: vitals.weightKg ? Number(vitals.weightKg) : null,
      },
      notes: notes.trim(),
      doctor_diagnosis: doctorDiagnosis.trim(),
      patient_id: selectedPatientId,
      doctor_id: authUser.id,
    } as const;

    setSubmitting(true);
    try {
      const response = await analyzeVisit(payload, token);
      setResult(response);
      toast.success("Visit analyzed successfully", {
        description: `Risk level: ${response.risk_level}`,
      });
    } catch (error) {
      toast.error("Visit analysis failed", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="careaxis-auth-bg min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-3" aria-label="Back to dashboard">
            <img src={careAxisLogo} alt="CareAxis CoPilot logo" className="h-9 w-auto" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">CareAxis CoPilot</span>
          </Link>
          <div className="ml-auto">
            <Button type="button" variant="outline" className="h-9" onClick={() => navigate("/dashboard")}>
              Back
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Consultation Analysis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submits directly to backend `POST /visits/analyze` and displays the returned analysis.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="border-border/70 bg-card/85 backdrop-blur">
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-display)" }}>Clinical Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label>Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId} disabled={loadingPatients}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} - {patient.health_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Symptoms</Label>
                <div className="flex gap-2">
                  <Input
                    value={symptomInput}
                    onChange={(event) => setSymptomInput(event.target.value)}
                    placeholder="Add symptom"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSymptom();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSymptom}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, index) => (
                    <Badge key={symptom} variant="secondary" className="gap-2">
                      {symptom}
                      <button type="button" onClick={() => removeSymptom(index)} aria-label={`Remove ${symptom}`}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 day">1 day</SelectItem>
                      <SelectItem value="2-3 days">2-3 days</SelectItem>
                      <SelectItem value="4-7 days">4-7 days</SelectItem>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value=">2 weeks">&gt;2 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Systolic BP</Label>
                  <Input
                    inputMode="numeric"
                    value={vitals.bpSys}
                    onChange={(event) => setVitals((prev) => ({ ...prev, bpSys: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Diastolic BP</Label>
                  <Input
                    inputMode="numeric"
                    value={vitals.bpDia}
                    onChange={(event) => setVitals((prev) => ({ ...prev, bpDia: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Temperature (C)</Label>
                  <Input
                    inputMode="decimal"
                    value={vitals.tempC}
                    onChange={(event) => setVitals((prev) => ({ ...prev, tempC: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Pulse</Label>
                  <Input
                    inputMode="numeric"
                    value={vitals.pulse}
                    onChange={(event) => setVitals((prev) => ({ ...prev, pulse: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>SpO2</Label>
                  <Input
                    inputMode="numeric"
                    value={vitals.spo2}
                    onChange={(event) => setVitals((prev) => ({ ...prev, spo2: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    inputMode="decimal"
                    value={vitals.weightKg}
                    onChange={(event) => setVitals((prev) => ({ ...prev, weightKg: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Doctor&apos;s diagnosis</Label>
                <Textarea
                  rows={3}
                  value={doctorDiagnosis}
                  onChange={(event) => setDoctorDiagnosis(event.target.value)}
                  placeholder="Doctor's provisional diagnosis..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Clinical notes</Label>
                <Textarea
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Doctor observations..."
                />
              </div>

              <Button type="button" className="w-full" onClick={() => void handleAnalyze()} disabled={submitting}>
                {submitting ? "Analyzing..." : "Analyze Visit"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/85 backdrop-blur">
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-display)" }}>Backend Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-background/40 p-3 text-sm">
                <div className="font-medium">Doctor</div>
                <div className="text-muted-foreground">{authUser?.full_name ?? "Not signed in"}</div>
              </div>

              <div className="rounded-md border bg-background/40 p-3 text-sm">
                <div className="font-medium">Selected patient</div>
                <div className="text-muted-foreground">
                  {selectedPatient ? `${selectedPatient.full_name} (${selectedPatient.health_id})` : "No patient selected"}
                </div>
              </div>

              {!result ? (
                <div className="rounded-md border bg-background/40 p-4 text-sm text-muted-foreground">
                  Submit the form to see response fields from `POST /visits/analyze`.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Visit ID</div>
                    <div className="text-muted-foreground break-all">{result.visit_id}</div>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Risk Level</div>
                    <div className="mt-1">
                      <Badge variant={result.risk_level.toLowerCase() === "critical" ? "destructive" : "outline"}>
                        {result.risk_level}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Confidence Score</div>
                    <div className="text-muted-foreground">{result.confidence_score}</div>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Guideline Deviation</div>
                    <div className="text-muted-foreground">{result.deviation_percentage}%</div>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Probable Causes</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      {result.probable_causes.map((cause) => (
                        <li key={cause}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Specialist Recommendation</div>
                    <div className="mt-1 text-muted-foreground">{result.specialist_recommendation}</div>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Summary</div>
                    <div className="mt-1 text-muted-foreground">{result.summary}</div>
                  </div>

                  <div className="rounded-md border bg-background/40 p-3 text-sm">
                    <div className="font-medium">Suggested Doctors</div>
                    {Array.isArray(result.suggested_doctors) && result.suggested_doctors.length ? (
                      <ul className="mt-2 space-y-2 text-muted-foreground">
                        {result.suggested_doctors.map((doctor, index) => (
                          <li key={`${doctor.name}-${index}`} className="rounded border bg-background/70 p-2">
                            <div className="font-medium text-foreground">{doctor.name}</div>
                            <div>Specialty: {doctor.specialty}</div>
                            <div>Reason: {doctor.reason}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 text-muted-foreground">No doctor suggestions available.</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
