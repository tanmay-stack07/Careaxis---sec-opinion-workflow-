import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings as SettingsIcon,
  ChevronDown,
  User,
  LogOut,
  Wifi,
  RefreshCw,
  QrCode,
} from "lucide-react";

import careAxisLogo from "@/assets/careaxis-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { getPatients, type PatientSummary } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser } from "@/lib/demo-auth";

const navItems = [
  { label: "Dashboard", key: "dashboard" },
  { label: "Patients", key: "patients" },
  { label: "Consultations", key: "consultations" },
  { label: "Reports", key: "reports" },
  { label: "Settings", key: "settings" },
] as const;

type Consultation = {
  patientName: string;
  careAxisId: string;
  date: string;
  diagnosis: string;
  deviation: "None" | "Low" | "Moderate" | "High";
};

function deviationFromId(id: string): Consultation["deviation"] {
  const options: Consultation["deviation"][] = ["None", "Low", "Moderate", "High"];
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return options[hash % options.length];
}

function toConsultationRows(patients: PatientSummary[]): Consultation[] {
  const today = new Date().toISOString().slice(0, 10);
  return patients.slice(0, 5).map((patient) => ({
    patientName: patient.full_name,
    careAxisId: patient.health_id,
    date: today,
    diagnosis: "Awaiting documented diagnosis",
    deviation: deviationFromId(patient.id),
  }));
}

function DeviationBadge({ value }: { value: Consultation["deviation"] }) {
  const variant = value === "High" ? "destructive" : value === "None" ? "secondary" : "outline";
  return <Badge variant={variant}>{value}</Badge>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = React.useState<"10" | "25" | "50">("10");
  const [language, setLanguage] = React.useState<"English" | "Hindi" | "Regional">("English");
  const [loadingPatients, setLoadingPatients] = React.useState(false);
  const [patientCount, setPatientCount] = React.useState(0);
  const [recentConsultations, setRecentConsultations] = React.useState<Consultation[]>([]);

  const authToken = getAuthToken() ?? undefined;
  const authUser = getAuthUser();
  const userName = authUser?.full_name ?? "Healthcare Worker";
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase() ?? "")
    .join("");

  const loadPatients = React.useCallback(async () => {
    setLoadingPatients(true);
    try {
      const response = await getPatients(authToken);
      setPatientCount(response.patients.length);
      setRecentConsultations(toConsultationRows(response.patients));
    } catch {
      toast.error("Failed to load patients", {
        description: "Check backend server and try again.",
      });
    } finally {
      setLoadingPatients(false);
    }
  }, [authToken]);

  React.useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  return (
    <main className="careaxis-auth-bg min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-3" aria-label="CareAxis CoPilot home">
            <img src={careAxisLogo} alt="CareAxis CoPilot logo" className="h-9 w-auto" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">CareAxis CoPilot</span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Button
                key={item.key}
                type="button"
                variant={item.key === "dashboard" ? "secondary" : "ghost"}
                className="h-9 px-3"
                onClick={() => {
                  if (item.key === "consultations") {
                    navigate("/consultation");
                    return;
                  }
                  if (item.key === "patients") {
                    navigate("/patients");
                    return;
                  }
                  if (item.key === "reports") {
                    navigate("/reports");
                    return;
                  }
                  if (item.key === "settings") {
                    navigate("/settings");
                    return;
                  }
                  toast.message(item.label);
                }}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-2">
            <div className="hidden w-full max-w-[420px] items-center md:flex" aria-label="Patient search">
              <div className="relative w-full">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  className="h-10 rounded-r-none pl-9"
                  placeholder="Search Patient (ID/Name/QR)..."
                  aria-label="Search patient by ID or name"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                aria-label="Scan QR code"
                onClick={() => toast.message("QR scan not wired yet")}
              >
                <QrCode className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => toast.message("No new notifications")}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="sr-only">1 unread notification</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitials || "HW"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left leading-tight sm:block">
                    <div className="text-sm font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground">Doctor</div>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.message("Use Settings for profile changes")}>
                  <User className="mr-2 h-4 w-4" aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    clearAuthSession();
                    navigate("/", { replace: true });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              <span className="text-foreground">Online</span>
              <span className="text-muted-foreground">-</span>
              <Wifi className="h-4 w-4" aria-hidden="true" />
              <span>Sync: {loadingPatients ? "in progress" : "up to date"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
                <SelectTrigger className="h-9 w-[160px]" aria-label="Select language">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-2"
                onClick={() => void loadPatients()}
                disabled={loadingPatients}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {loadingPatients ? "Syncing..." : "Sync"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Today's Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Snapshot of activity across patients and consults.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Patients", value: loadingPatients ? "..." : String(patientCount), delta: "Live" },
            { label: "Consults", value: "32", delta: "+8%" },
            { label: "Pending", value: "5", delta: "-3%" },
            { label: "Flags", value: "2", delta: "+1" },
          ].map((c) => (
            <Card key={c.label} className="border-border/70 bg-card/85 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-baseline justify-between gap-4">
                <div className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {c.value}
                </div>
                <Badge variant="outline" className="text-xs">
                  {c.delta}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Recent Consultations
              </h2>
              <p className="text-sm text-muted-foreground">Derived from latest backend patient records.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as typeof pageSize)}>
                <SelectTrigger className="h-9 w-[120px]" aria-label="Rows per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="hidden border-border/70 bg-card/85 backdrop-blur md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>CareAxis ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Deviation</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentConsultations.slice(0, Number(pageSize)).map((row) => (
                    <TableRow key={row.careAxisId}>
                      <TableCell className="font-medium">{row.patientName}</TableCell>
                      <TableCell>{row.careAxisId}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.diagnosis}</TableCell>
                      <TableCell>
                        <DeviationBadge value={row.deviation} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9"
                          onClick={() => navigate("/consultation")}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!recentConsultations.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {loadingPatients ? "Loading patients..." : "No patients found in backend."}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:hidden">
            {recentConsultations.slice(0, Number(pageSize)).map((row) => (
              <Card key={row.careAxisId} className="border-border/70 bg-card/85 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{row.patientName}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {row.careAxisId} - {row.date}
                      </div>
                    </div>
                    <DeviationBadge value={row.deviation} />
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="text-xs text-muted-foreground">Diagnosis</div>
                    <div className="font-medium">{row.diagnosis}</div>
                  </div>

                  <div className="mt-4">
                    <Button type="button" variant="outline" className="h-9 w-full" onClick={() => navigate("/consultation")}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!recentConsultations.length ? (
              <Card className="border-border/70 bg-card/85 backdrop-blur">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  {loadingPatients ? "Loading patients..." : "No patients found in backend."}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Quick Actions
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Button type="button" className="h-11" onClick={() => navigate("/patients")}>
              New Patient Registration
            </Button>
            <Button type="button" variant="secondary" className="h-11" onClick={() => navigate("/consultation")}>
              New Consultation
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => navigate("/reports")}>
              View Reports
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
