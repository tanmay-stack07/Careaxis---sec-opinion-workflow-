const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? (payload as { detail?: unknown }).detail
        : payload;

    const message =
      typeof detail === "string" && detail.trim().length
        ? detail
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, detail);
  }

  return payload as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export type RegisterRequest = {
  full_name: string;
  email: string;
  password: string;
  organization: string;
};

export type RegisterResponse = {
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    full_name: string;
  };
};

export type PatientSummary = {
  id: string;
  health_id: string;
  full_name: string;
  phone: string;
};

export type GetPatientsResponse = {
  patients: PatientSummary[];
};

export type CreatePatientRequest = {
  full_name: string;
  phone: string;
  age: number;
  gender: string;
};

export type CreatePatientResponse = {
  patient_id: string;
  health_id: string;
};

export type AnalyzeVisitRequest = {
  symptoms: string[];
  duration: string;
  severity: string;
  vitals: Record<string, unknown>;
  notes: string;
  doctor_diagnosis: string;
  patient_id: string;
  doctor_id: string;
};

export type SuggestedDoctor = {
  name: string;
  specialty: string;
  reason: string;
};

export type AnalyzeVisitResponse = {
  visit_id: string;
  probable_causes: string[];
  risk_level: string;
  specialist_recommendation: string;
  summary: string;
  confidence_score: number;
  deviation_percentage: number;
  suggested_doctors: SuggestedDoctor[];
};

export type PatientReportVisit = {
  visit_id: string;
  visit_created_at: string;
  doctor: {
    id: string | null;
    full_name: string | null;
  };
  clinical_input: {
    symptoms: string[];
    duration: string | null;
    severity: string | null;
    vitals: Record<string, unknown> | null;
    notes: string | null;
    doctor_diagnosis: string | null;
  };
  ai_analysis: {
    probable_causes: string[];
    risk_level: string | null;
    specialist_recommendation: string | null;
    summary: string | null;
    confidence_score: number | null;
    deviation_percentage: number | null;
    suggested_doctors: SuggestedDoctor[];
    created_at: string | null;
  } | null;
};

export type PatientReportResponse = {
  patient: {
    id: string;
    health_id: string;
    full_name: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    created_at: string | null;
  };
  report_period: {
    from_date: string | null;
    to_date: string | null;
    generated_at: string;
  };
  totals: {
    total_visits: number;
    total_ai_analyses: number;
  };
  visits: PatientReportVisit[];
};

export function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getPatients(token?: string) {
  return apiRequest<GetPatientsResponse>("/patients", {
    method: "GET",
    token,
  });
}

export function createPatient(payload: CreatePatientRequest, token?: string) {
  return apiRequest<CreatePatientResponse>("/patients", {
    method: "POST",
    body: payload,
    token,
  });
}

export function analyzeVisit(payload: AnalyzeVisitRequest, token?: string) {
  return apiRequest<AnalyzeVisitResponse>("/visits/analyze", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getPatientReport(patientId: string, token?: string, fromDate?: string, toDate?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const query = params.toString();
  const path = `/reports/patients/${patientId}${query ? `?${query}` : ""}`;

  return apiRequest<PatientReportResponse>(path, {
    method: "GET",
    token,
  });
}

export async function downloadPatientReportPdf(patientId: string, token?: string, fromDate?: string, toDate?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const query = params.toString();

  const response = await fetch(`${API_BASE_URL}/reports/patients/${patientId}/pdf${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? (payload as { detail?: unknown }).detail
        : payload;
    const message =
      typeof detail === "string" && detail.trim().length
        ? detail
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, detail);
  }

  return response.blob();
}
