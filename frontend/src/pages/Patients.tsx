import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { createPatient, getApiErrorMessage, getPatients, type PatientSummary } from "@/lib/api";
import { getAuthToken } from "@/lib/demo-auth";

type NewPatientForm = {
  full_name: string;
  phone: string;
  age: string;
  gender: string;
};

const emptyNewPatientForm: NewPatientForm = {
  full_name: "",
  phone: "",
  age: "",
  gender: "Male",
};

export default function Patients() {
  const navigate = useNavigate();
  const token = getAuthToken() ?? undefined;

  const [patients, setPatients] = React.useState<PatientSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [newPatientOpen, setNewPatientOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newPatientForm, setNewPatientForm] = React.useState<NewPatientForm>(emptyNewPatientForm);

  const loadPatients = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPatients(token);
      setPatients(response.patients);
    } catch (error) {
      toast.error("Failed to load patients", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filteredPatients = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) =>
      `${patient.full_name} ${patient.health_id} ${patient.phone}`.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const handleCreatePatient = async () => {
    if (!newPatientForm.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!newPatientForm.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    const ageNumber = Number(newPatientForm.age);
    if (!Number.isFinite(ageNumber) || ageNumber <= 0) {
      toast.error("Valid age is required");
      return;
    }

    setCreating(true);
    try {
      const response = await createPatient(
        {
          full_name: newPatientForm.full_name.trim(),
          phone: newPatientForm.phone.trim(),
          age: Math.trunc(ageNumber),
          gender: newPatientForm.gender.trim(),
        },
        token,
      );

      toast.success("Patient created", {
        description: `Patient ID: ${response.patient_id} | Health ID: ${response.health_id}`,
      });

      setNewPatientForm(emptyNewPatientForm);
      setNewPatientOpen(false);
      await loadPatients();
    } catch (error) {
      toast.error("Failed to create patient", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setCreating(false);
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
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" className="h-9" onClick={() => navigate("/dashboard")}>
              Back
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Patients</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="mt-3 text-[28px] font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Patient Records
            </h1>
            <p className="mt-1 text-base text-muted-foreground">Live data from backend `GET /patients`.</p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11 gap-2" onClick={() => void loadPatients()} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button type="button" className="h-11 gap-2" onClick={() => setNewPatientOpen(true)}>
              <Plus className="h-4 w-4" />
              New Patient
            </Button>
          </div>
        </div>

        <Card className="mt-6 border-border/70 bg-card/85 backdrop-blur">
          <CardContent className="p-4">
            <div className="relative max-w-[420px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 pl-9"
                placeholder="Search by name, health ID, phone"
                aria-label="Search patients"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="rounded-xl border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{patient.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">Health ID: {patient.health_id}</div>
                <div className="text-muted-foreground">Phone: {patient.phone}</div>
                <div className="pt-2">
                  <Button type="button" variant="outline" className="h-9" onClick={() => navigate("/consultation")}>
                    Start Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!filteredPatients.length ? (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            {loading ? "Loading patients..." : "No patients match your search."}
          </div>
        ) : null}
      </section>

      <Dialog open={newPatientOpen} onOpenChange={setNewPatientOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>New Patient Registration</DialogTitle>
            <DialogDescription>Creates a patient using backend `POST /patients`.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="patient-full-name">Full Name</Label>
              <Input
                id="patient-full-name"
                value={newPatientForm.full_name}
                onChange={(event) => setNewPatientForm((prev) => ({ ...prev, full_name: event.target.value }))}
                placeholder="Patient name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="patient-phone">Phone</Label>
              <Input
                id="patient-phone"
                value={newPatientForm.phone}
                onChange={(event) => setNewPatientForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone number"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="patient-age">Age</Label>
                <Input
                  id="patient-age"
                  inputMode="numeric"
                  value={newPatientForm.age}
                  onChange={(event) => setNewPatientForm((prev) => ({ ...prev, age: event.target.value }))}
                  placeholder="Age"
                />
              </div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select
                  value={newPatientForm.gender}
                  onValueChange={(value) => setNewPatientForm((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNewPatientOpen(false);
                setNewPatientForm(emptyNewPatientForm);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCreatePatient()} disabled={creating}>
              {creating ? "Creating..." : "Create Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
