import * as React from "react";
import { format } from "date-fns";
import {
  Camera,
  Download,
  FileDown,
  Loader2,
  Mail,
  Printer,
  Search,
  Send,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import careAxisLogo from "@/assets/careaxis-logo.png";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  downloadPatientReportPdf,
  getApiErrorMessage,
  getPatientReport,
  getPatients,
  type PatientReportResponse,
  type PatientSummary,
} from "@/lib/api";
import { getAuthToken } from "@/lib/demo-auth";

type ComplianceSlice = {
  label: string;
  value: number;
  color: string;
};

const complianceData: ComplianceSlice[] = [
  { label: "No Deviation", value: 88, color: "hsl(var(--success))" },
  { label: "Minor", value: 7, color: "hsl(var(--primary))" },
  { label: "Moderate", value: 4, color: "hsl(var(--warning))" },
  { label: "Severe", value: 1, color: "hsl(var(--destructive))" },
];

function DateRangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange: (v?: Date) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="h-10 justify-start text-left font-normal">
            {value ? format(value, "dd/MM/yyyy") : <span className="text-muted-foreground">DD/MM/YYYY</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => onChange(d ?? undefined)}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ReportPreviewModal({
  open,
  onOpenChange,
  title,
  children,
  onDownloadPdf,
  downloadingPdf,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
  onDownloadPdf?: () => void;
  downloadingPdf?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none p-0" style={{ width: "min(96vw, 900px)", height: "min(92vh, 700px)" }}>
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
          <DialogHeader className="border-b p-5">
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>{title}</DialogTitle>
            <DialogDescription>Preview - use actions below to export/share.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-5">
            <div className="animate-fade-in rounded-lg border bg-background/60 p-5">
              {children}
            </div>
          </div>

          <DialogFooter className="border-t p-4 sm:p-5">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  onClick={() => {
                    if (onDownloadPdf) {
                      onDownloadPdf();
                      return;
                    }
                    toast.message("Download PDF", { description: "Export is UI-only in the prototype." });
                  }}
                  disabled={Boolean(downloadingPdf)}
                >
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                  {downloadingPdf ? "Downloading..." : "Download PDF"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  onClick={() => toast.message("Download CSV", { description: "Export is UI-only in the prototype." })}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download CSV
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  onClick={() => toast.message("WhatsApp", { description: "Sharing is UI-only in the prototype." })}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  onClick={() => toast.message("Email", { description: "Email is UI-only in the prototype." })}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  onClick={() => toast.message("Print", { description: "Printing is UI-only in the prototype." })}
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Print
                </Button>
                <Button type="button" className="h-10" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Reports() {
  const token = getAuthToken() ?? undefined;
  const [patients, setPatients] = React.useState<PatientSummary[]>([]);
  const [loadingPatients, setLoadingPatients] = React.useState(false);
  const [patientQuery, setPatientQuery] = React.useState("");
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>("");
  const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
  const [toDate, setToDate] = React.useState<Date | undefined>(undefined);

  const [consultFrom, setConsultFrom] = React.useState<Date | undefined>(new Date("2026-02-01"));
  const [consultTo, setConsultTo] = React.useState<Date | undefined>(new Date("2026-02-21"));

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [loadingPatientReport, setLoadingPatientReport] = React.useState(false);
  const [downloadingPatientId, setDownloadingPatientId] = React.useState<string | null>(null);
  const [patientReport, setPatientReport] = React.useState<PatientReportResponse | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewTitle, setPreviewTitle] = React.useState("Report Preview");
  const [previewKind, setPreviewKind] = React.useState<"empty" | "patient" | "consultation" | "custom">("empty");

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null;

  const filteredPatients = React.useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) => `${patient.full_name} ${patient.health_id}`.toLowerCase().includes(q));
  }, [patientQuery, patients]);

  const loadPatients = React.useCallback(async () => {
    setLoadingPatients(true);
    try {
      const response = await getPatients(token);
      setPatients(response.patients);
      setSelectedPatientId((current) => {
        if (current && response.patients.some((patient) => patient.id === current)) return current;
        return response.patients[0]?.id ?? "";
      });
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
    const intervalId = window.setInterval(() => {
      void loadPatients();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [loadPatients]);

  const fetchPatientReport = React.useCallback(
    async (patientId?: string) => {
      const targetPatientId = patientId ?? selectedPatientId;
      if (!targetPatientId) {
        toast.error("Please select a patient first.");
        return;
      }

      setLoadingPatientReport(true);
      try {
        const response = await getPatientReport(
          targetPatientId,
          token,
          fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
          toDate ? format(toDate, "yyyy-MM-dd") : undefined,
        );
        setPatientReport(response);
        setPreviewKind("patient");
        setPreviewTitle("Patient Detailed Report");
        setPreviewOpen(true);
      } catch (error) {
        toast.error("Failed to generate report", {
          description: getApiErrorMessage(error),
        });
      } finally {
        setLoadingPatientReport(false);
      }
    },
    [fromDate, selectedPatientId, toDate, token],
  );

  const handleDownloadPatientReport = React.useCallback(
    async (patientId?: string) => {
      const targetPatientId = patientId ?? selectedPatientId;
      if (!targetPatientId) {
        toast.error("Please select a patient first.");
        return;
      }

      setDownloadingPatientId(targetPatientId);
      try {
        const blob = await downloadPatientReportPdf(
          targetPatientId,
          token,
          fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
          toDate ? format(toDate, "yyyy-MM-dd") : undefined,
        );
        const currentPatient = patients.find((patient) => patient.id === targetPatientId);
        const filename = `patient-report-${currentPatient?.health_id ?? targetPatientId}.pdf`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Report downloaded", {
          description: filename,
        });
      } catch (error) {
        toast.error("Failed to download report", {
          description: getApiErrorMessage(error),
        });
      } finally {
        setDownloadingPatientId(null);
      }
    },
    [fromDate, patients, selectedPatientId, toDate, token],
  );

  const generate = async (kind: typeof previewKind) => {
    if (kind === "patient") {
      await fetchPatientReport();
      return;
    }

    setIsGenerating(true);
    toast.message("Generating report...", { description: "Demo animation only." });
    await new Promise((r) => setTimeout(r, 800));
    setIsGenerating(false);

    setPreviewKind(kind);
    setPreviewTitle(
      kind === "patient"
        ? "Patient Visit Summary"
        : kind === "consultation"
          ? "Consultation Reports"
          : kind === "custom"
            ? "Custom Report"
            : "Report Preview",
    );
    setPreviewOpen(true);
    toast.success("Report ready", { description: "Preview generated (demo)." });
  };

  const formatVitals = (vitals: Record<string, unknown> | null) => {
    if (!vitals) return "N/A";
    const bp = vitals["blood_pressure"] as { systolic?: number | null; diastolic?: number | null } | undefined;
    const items = [
      bp?.systolic && bp?.diastolic ? `BP ${bp.systolic}/${bp.diastolic}` : null,
      vitals["temperature_c"] ? `Temp ${vitals["temperature_c"]} C` : null,
      vitals["pulse"] ? `Pulse ${vitals["pulse"]}` : null,
      vitals["spo2"] ? `SpO2 ${vitals["spo2"]}%` : null,
      vitals["weight_kg"] ? `Weight ${vitals["weight_kg"]} kg` : null,
    ].filter(Boolean) as string[];

    if (!items.length) return "N/A";
    return items.join(" | ");
  };

  const previewBody =
    previewKind === "patient" ? (
      !patientReport ? (
        <div className="rounded-md border bg-background/40 p-4 text-sm text-muted-foreground">
          Generate a patient report to view details.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <div className="text-sm font-semibold tracking-[0.18em] text-muted-foreground">CAREAXIS COPILOT</div>
            <div className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Patient Detailed Report
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 text-sm">
              <div className="text-muted-foreground">Patient</div>
              <div className="text-base font-semibold">{patientReport.patient.full_name}</div>
              <div className="text-muted-foreground">CareAxis ID: {patientReport.patient.health_id}</div>
              <div className="text-muted-foreground">
                Age: {patientReport.patient.age ?? "N/A"} | Gender: {patientReport.patient.gender ?? "N/A"}
              </div>
            </div>
            <div className="space-y-1 text-sm md:text-right">
              <div className="text-muted-foreground">Report Period</div>
              <div className="font-medium">
                {patientReport.report_period.from_date && patientReport.report_period.to_date
                  ? `${patientReport.report_period.from_date} - ${patientReport.report_period.to_date}`
                  : "All time"}
              </div>
              <div className="text-muted-foreground">Total Visits: {patientReport.totals.total_visits}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">VISIT HISTORY</div>
            <div className="mt-3 space-y-3">
              {patientReport.visits.length ? (
                patientReport.visits.map((visit, index) => (
                  <div key={visit.visit_id} className="rounded-md border bg-card/60 p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-medium">
                          Visit {index + 1}:{" "}
                          {visit.visit_created_at ? format(new Date(visit.visit_created_at), "dd MMM yyyy, hh:mm a") : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">Visit ID: {visit.visit_id}</div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="text-muted-foreground">Doctor: {visit.doctor.full_name ?? "N/A"}</div>
                        <div className="text-muted-foreground">Duration: {visit.clinical_input.duration ?? "N/A"}</div>
                        <div className="text-muted-foreground">Severity: {visit.clinical_input.severity ?? "N/A"}</div>
                        <div className="text-muted-foreground">Vitals: {formatVitals(visit.clinical_input.vitals)}</div>
                      </div>

                      <div className="text-muted-foreground">
                        Symptoms: {visit.clinical_input.symptoms.length ? visit.clinical_input.symptoms.join(", ") : "N/A"}
                      </div>
                      <div className="text-muted-foreground">Doctor Diagnosis: {visit.clinical_input.doctor_diagnosis ?? "N/A"}</div>
                      <div className="text-muted-foreground">Clinical Notes: {visit.clinical_input.notes ?? "N/A"}</div>

                      {visit.ai_analysis ? (
                        <div className="rounded-md border bg-background/60 p-3">
                          <div className="font-medium">AI Analysis</div>
                          <div className="mt-1 text-muted-foreground">Risk: {visit.ai_analysis.risk_level ?? "N/A"}</div>
                          <div className="text-muted-foreground">
                            Confidence: {visit.ai_analysis.confidence_score ?? "N/A"}
                          </div>
                          <div className="text-muted-foreground">
                            Guideline Deviation: {visit.ai_analysis.deviation_percentage ?? "N/A"}%
                          </div>
                          <div className="text-muted-foreground">
                            Probable Causes:{" "}
                            {visit.ai_analysis.probable_causes.length ? visit.ai_analysis.probable_causes.join(", ") : "N/A"}
                          </div>
                          <div className="text-muted-foreground">
                            Recommendation: {visit.ai_analysis.specialist_recommendation ?? "N/A"}
                          </div>
                          <div className="text-muted-foreground">Summary: {visit.ai_analysis.summary ?? "N/A"}</div>
                          <div className="text-muted-foreground">
                            Suggested Doctors:{" "}
                            {visit.ai_analysis.suggested_doctors.length
                              ? visit.ai_analysis.suggested_doctors
                                  .map((doc) => `${doc.name} (${doc.specialty})`)
                                  .join(", ")
                              : "N/A"}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">AI analysis not available for this visit.</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border bg-background/40 p-4 text-sm text-muted-foreground">
                  No visits available for this range.
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Generated: {format(new Date(patientReport.report_period.generated_at), "dd MMM yyyy, hh:mm a")} | CareAxis CoPilot
          </div>
        </div>
      )
    ) : previewKind === "consultation" ? (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Summary</div>
            <div className="text-lg font-semibold">Consultations Overview</div>
          </div>
          <div className="text-sm text-muted-foreground">Period: {consultFrom ? format(consultFrom, "dd MMM") : "â€”"} - {consultTo ? format(consultTo, "dd MMM") : "â€”"}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Total Consults", value: "156" },
            { label: "Completed", value: "148" },
            { label: "Flagged", value: "8" },
            { label: "Avg Time", value: "12 min" },
          ].map((c) => (
            <div key={c.label} className="rounded-md border bg-background/50 p-4">
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="text-sm font-semibold">Consultation List (demo)</div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report Generated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { date: "21 Feb 2026", doctor: "Dr. Sharma", facility: "PHC - XYZ", dx: "Hypertension", status: "Completed", gen: "Yes" },
                { date: "20 Feb 2026", doctor: "Dr. Verma", facility: "CHC - Lakshmi", dx: "Diabetes", status: "Completed", gen: "No" },
                { date: "19 Feb 2026", doctor: "Dr. Nair", facility: "District Hospital", dx: "Asthma", status: "Pending", gen: "No" },
              ].map((r) => (
                <TableRow key={r.date + r.dx}>
                  <TableCell className="font-medium">{r.date}</TableCell>
                  <TableCell>{r.doctor}</TableCell>
                  <TableCell>{r.facility}</TableCell>
                  <TableCell>{r.dx}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.gen}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9"
                      onClick={() => toast.message("Generate", { description: "Per-row generation is UI-only." })}
                    >
                      Generate Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    ) : previewKind === "custom" ? (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Custom Report
          </div>
          <div className="mt-1 text-sm text-muted-foreground">Template-driven preview (demo)</div>
        </div>
        <Separator />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-background/50 p-4">
            <div className="text-sm font-semibold">Selected fields</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Patient demographics</li>
              <li>Diagnosis codes</li>
              <li>Medications</li>
              <li>AI compliance status</li>
            </ul>
          </div>
          <div className="rounded-md border bg-background/50 p-4">
            <div className="text-sm font-semibold">Filters</div>
            <div className="mt-2 text-sm text-muted-foreground">Date range + facility + doctor (demo)</div>
            <div className="mt-3 text-sm font-semibold">Output format</div>
            <div className="mt-1 text-sm text-muted-foreground">PDF</div>
          </div>
        </div>
      </div>
    ) : (
      <div className="py-14 text-center">
        <div className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          No reports generated yet
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Select a patient or consultation to generate your first report.
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => void generate("patient")}>Generate Patient Report</Button>
          <Button type="button" variant="secondary" onClick={() => void generate("consultation")}>Generate Consultation Report</Button>
        </div>
      </div>
    );

  return (
    <main className="careaxis-auth-bg min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <img src={careAxisLogo} alt="CareAxis CoPilot logo" className="h-9 w-auto" />

          <div className="ml-2 min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="h-10 gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export All Reports
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => toast.message("Export", { description: "ZIP export is UI-only." })}>
                  Export All Patient Reports (ZIP)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.message("Export", { description: "ZIP export is UI-only." })}>
                  Export All Consultation Reports (ZIP)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.message("Export", { description: "PDF export is UI-only." })}>
                  Export Compliance Summary (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.message("Export", { description: "CSV export is UI-only." })}>
                  Export Raw Data (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Reports & Analytics
            </h1>
            <p className="mt-1 text-base text-muted-foreground">Generate and view consultation reports and insights</p>
          </div>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="w-full justify-start bg-muted/60">
            <TabsTrigger value="patient">Patient Reports</TabsTrigger>
            <TabsTrigger value="consultation">Consultation Reports</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>

          {/* Patient Reports */}
          <TabsContent value="patient" className="mt-4">
            <div className="grid gap-4">
              <Card className="border-border/70 bg-card/85 backdrop-blur">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "var(--font-display)" }}>Patient selection</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
                    <div className="grid gap-2">
                      <Label>Select patient</Label>
                      <div className="flex gap-2">
                        <div className="relative w-full">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={patientQuery}
                            onChange={(e) => setPatientQuery(e.target.value)}
                            placeholder="Search Patient Name/ID..."
                            className="h-10 pl-9"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 gap-2"
                          onClick={() => toast.message("Scan QR", { description: "QR scanning is UI-only in this demo." })}
                        >
                          <Camera className="h-4 w-4" aria-hidden="true" />
                          Scan QR
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filteredPatients.map((p) => (
                          <Button
                            key={p.id}
                            type="button"
                            variant={p.id === selectedPatientId ? "secondary" : "ghost"}
                            className="h-9"
                            onClick={() => setSelectedPatientId(p.id)}
                          >
                            {p.full_name} | {p.health_id}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Quick info</Label>
                      <div className="rounded-md border bg-background/50 p-3 text-sm">
                        {selectedPatient ? (
                          <>
                            <div className="font-medium">{selectedPatient.full_name}</div>
                            <div className="mt-1 text-muted-foreground">
                              {selectedPatient.health_id} | Phone {selectedPatient.phone || "N/A"}
                            </div>
                          </>
                        ) : (
                          <div className="text-muted-foreground">No patient selected</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background/30">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Health ID</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingPatients ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-muted-foreground">
                              Loading patients...
                            </TableCell>
                          </TableRow>
                        ) : filteredPatients.length ? (
                          filteredPatients.map((patient) => (
                            <TableRow key={patient.id}>
                              <TableCell className="font-medium">{patient.full_name}</TableCell>
                              <TableCell>{patient.health_id}</TableCell>
                              <TableCell>{patient.phone || "N/A"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9"
                                    onClick={() => {
                                      setSelectedPatientId(patient.id);
                                      void fetchPatientReport(patient.id);
                                    }}
                                    disabled={loadingPatientReport}
                                  >
                                    View Report
                                  </Button>
                                  <Button
                                    type="button"
                                    className="h-9"
                                    onClick={() => void handleDownloadPatientReport(patient.id)}
                                    disabled={downloadingPatientId === patient.id}
                                  >
                                    {downloadingPatientId === patient.id ? "Downloading..." : "Download PDF"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-muted-foreground">
                              No patients found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <DateRangeField label="From" value={fromDate} onChange={setFromDate} />
                    <DateRangeField label="To" value={toDate} onChange={setToDate} />
                    <div className="grid gap-2">
                      <Label className="opacity-0">Generate</Label>
                      <Button
                        type="button"
                        className="h-10"
                        disabled={loadingPatientReport || !selectedPatientId}
                        onClick={() => void fetchPatientReport()}
                      >
                        {loadingPatientReport ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Generating...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm font-semibold">Report preview</div>
                    <div className="mt-3 rounded-lg border bg-background/40 p-5 text-sm text-muted-foreground">
                      {patientReport
                        ? `Latest report loaded for ${patientReport.patient.full_name}.`
                        : "Generate a report to see a preview."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consultation Reports */}
          <TabsContent value="consultation" className="mt-4">
            <div className="grid gap-4">
              <Card className="border-border/70 bg-card/85 backdrop-blur">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "var(--font-display)" }}>Filter options</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_220px_220px_240px_auto]">
                    <DateRangeField label="From" value={consultFrom} onChange={setConsultFrom} />
                    <DateRangeField label="To" value={consultTo} onChange={setConsultTo} />

                    <div className="grid gap-2">
                      <Label>Doctor</Label>
                      <Select defaultValue="All">
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Dr. Sharma">Dr. Sharma</SelectItem>
                          <SelectItem value="Dr. Verma">Dr. Verma</SelectItem>
                          <SelectItem value="Dr. Nair">Dr. Nair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Facility</Label>
                      <Select defaultValue="All">
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="PHC">PHC</SelectItem>
                          <SelectItem value="CHC">CHC</SelectItem>
                          <SelectItem value="District">District Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Diagnosis</Label>
                      <Input className="h-10" placeholder="Search..." />
                    </div>

                    <div className="grid gap-2">
                      <Label className="opacity-0">Generate</Label>
                      <Button type="button" className="h-10" disabled={isGenerating} onClick={() => void generate("consultation")}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Generatingâ€¦
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { label: "Total Consults", value: "156" },
                      { label: "Completed", value: "148" },
                      { label: "Flagged", value: "8" },
                      { label: "Avg Time per Patient", value: "12 min" },
                    ].map((c) => (
                      <Card key={c.label} className="border-border/70 bg-card/85">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground">{c.label}</div>
                          <div className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                            {c.value}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="rounded-lg border bg-background/40 p-4 text-sm text-muted-foreground">
                    Generate to open a detailed preview (demo).
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Reports */}
          <TabsContent value="compliance" className="mt-4">
            <Card className="border-border/70 bg-card/85 backdrop-blur">
              <CardHeader>
                <CardTitle style={{ fontFamily: "var(--font-display)" }}>AI Compliance Summary (This Month)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[360px_1fr]">
                <div className="rounded-lg border bg-background/50 p-4">
                  <div className="text-sm font-semibold">Deviation distribution</div>
                  <div className="mt-4 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={complianceData}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={72}
                          outerRadius={96}
                          paddingAngle={2}
                        >
                          {complianceData.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {complianceData.map((s) => (
                      <div key={s.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                          <span>{s.label}</span>
                        </div>
                        <span className="text-muted-foreground">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-lg border bg-background/50 p-4">
                    <div className="text-sm font-semibold">Top deviation types</div>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                      <li>Follow-up duration â€” 3 cases</li>
                      <li>Medication dosage â€” 2 cases</li>
                      <li>Red-flag escalation â€” 1 case</li>
                    </ol>
                  </div>

                  <div className="rounded-lg border bg-background/50 p-4">
                    <div className="text-sm font-semibold">Guidelines most referenced</div>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                      <li>ICMR Acute Fever Protocol 2025</li>
                      <li>National Standard Treatment Guidelines</li>
                      <li>WHO Essential Medicines List</li>
                    </ol>
                  </div>

                  <div className="rounded-lg border bg-background/50 p-4">
                    <div className="text-sm font-semibold">Compliance trend (demo)</div>
                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Overall alignment</span>
                        <span className="font-medium">91%</span>
                      </div>
                      <Progress value={91} />
                      <div className="text-xs text-muted-foreground">Calculated from monthly distribution (demo).</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports */}
          <TabsContent value="custom" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <Card className="border-border/70 bg-card/85 backdrop-blur">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "var(--font-display)" }}>Report builder</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Report name</Label>
                    <Input placeholder="Monthly Compliance Summary" />
                  </div>

                  <div className="rounded-lg border bg-background/50 p-4">
                    <div className="text-sm font-semibold">Select data fields</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        "Patient demographics",
                        "Diagnosis codes",
                        "Medications",
                        "Vital signs",
                        "AI compliance status",
                        "Follow-up data",
                      ].map((label) => (
                        <label key={label} className="flex items-start gap-2 text-sm">
                          <Checkbox defaultChecked={label === "Patient demographics" || label === "Diagnosis codes"} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <DateRangeField label="From" value={consultFrom} onChange={setConsultFrom} />
                    <DateRangeField label="To" value={consultTo} onChange={setConsultTo} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Doctor</Label>
                      <Select defaultValue="All">
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Dr. Sharma">Dr. Sharma</SelectItem>
                          <SelectItem value="Dr. Verma">Dr. Verma</SelectItem>
                          <SelectItem value="Dr. Nair">Dr. Nair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Facility</Label>
                      <Select defaultValue="All">
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="PHC">PHC</SelectItem>
                          <SelectItem value="CHC">CHC</SelectItem>
                          <SelectItem value="District">District Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Diagnosis</Label>
                      <Input className="h-10" placeholder="Select diagnosis..." />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background/50 p-4">
                    <div className="text-sm font-semibold">Output format</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { label: "PDF", active: true },
                        { label: "CSV", active: false },
                        { label: "Excel", active: false },
                      ].map((o) => (
                        <Button key={o.label} type="button" variant={o.active ? "secondary" : "outline"} className="h-9">
                          {o.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Optional notes for the report..." />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" className="h-10" onClick={() => toast.message("Saved", { description: "Template save is UI-only." })}>
                      Save Report Template
                    </Button>
                    <Button type="button" className="h-10" disabled={isGenerating} onClick={() => void generate("custom")}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Generatingâ€¦
                        </>
                      ) : (
                        "Generate Report"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/85 backdrop-blur">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "var(--font-display)" }}>Saved report templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Monthly Compliance Summary",
                    "Weekly Consultation Report",
                    "Patient Visit History",
                    "Deviation Analysis",
                  ].map((t) => (
                    <div key={t} className="rounded-lg border bg-background/50 p-4">
                      <div className="font-medium">ðŸ“„ {t}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" variant="outline" className="h-9" onClick={() => toast.message("Edit", { description: "Editing is UI-only." })}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" className="h-9" onClick={() => void generate("custom")}>
                          Run
                        </Button>
                        <Button type="button" variant="outline" className="h-9" onClick={() => toast.message("Delete", { description: "Deleting is UI-only." })}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <ReportPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={previewTitle}
        onDownloadPdf={previewKind === "patient" ? () => void handleDownloadPatientReport() : undefined}
        downloadingPdf={previewKind === "patient" ? downloadingPatientId === selectedPatientId : false}
      >
        {previewBody}
      </ReportPreviewModal>
    </main>
  );
}

