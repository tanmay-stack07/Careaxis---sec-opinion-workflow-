from datetime import date, datetime
import textwrap
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import uuid
from psycopg2.extras import Json
import os

from db import ensure_schema, get_connection
import auth
import ai

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "https://careaxis-sec-opinion-workflow.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "CareAxis Backend"}


def _parse_report_date(value: Optional[str], field_name: str) -> Optional[date]:
    if value is None:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}. Expected format YYYY-MM-DD.",
        ) from exc


def _parse_uuid(value: str, field_name: str) -> str:
    try:
        return str(uuid.UUID(value))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}. Expected UUID.") from exc


def _to_iso(value: Any) -> Optional[str]:
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _safe_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _as_string_list(value: Any) -> List[str]:
    if not isinstance(value, list):
        return []
    return [str(item) for item in value]


def _as_suggested_doctors(value: Any) -> List[Dict[str, str]]:
    if not isinstance(value, list):
        return []
    doctors: List[Dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        specialty = str(item.get("specialty", "")).strip()
        reason = str(item.get("reason", "")).strip()
        if not name:
            continue
        doctors.append(
            {
                "name": name,
                "specialty": specialty or "General Medicine",
                "reason": reason or "Specialist fit based on reported symptoms.",
            }
        )
    return doctors


def _build_patient_report_payload(
    conn: Any, patient_id: str, from_date: Optional[date], to_date: Optional[date]
) -> Dict[str, Any]:
    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date must be on or before to_date.")

    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, health_id, full_name, phone, age, gender, created_at
        FROM patients
        WHERE id = %s
        """,
        (patient_id,),
    )
    patient = cur.fetchone()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    cur.execute(
        """
        SELECT
            v.id AS visit_id,
            v.created_at AS visit_created_at,
            v.doctor_id AS doctor_id,
            u.full_name AS doctor_name,
            ci.symptoms AS symptoms,
            ci.duration AS duration,
            ci.severity AS severity,
            ci.vitals AS vitals,
            ci.notes AS notes,
            ci.doctor_diagnosis AS doctor_diagnosis,
            a.id AS ai_id,
            a.probable_causes AS probable_causes,
            a.risk_level AS risk_level,
            a.specialist_recommendation AS specialist_recommendation,
            a.summary AS summary,
            a.confidence_score AS confidence_score,
            a.deviation_percentage AS deviation_percentage,
            a.suggested_doctors AS suggested_doctors,
            a.created_at AS ai_created_at
        FROM visits v
        LEFT JOIN users u ON u.id = v.doctor_id
        LEFT JOIN clinical_inputs ci ON ci.visit_id = v.id
        LEFT JOIN ai_analysis a ON a.visit_id = v.id
        WHERE v.patient_id = %s
          AND (%s::date IS NULL OR v.created_at::date >= %s::date)
          AND (%s::date IS NULL OR v.created_at::date <= %s::date)
        ORDER BY v.created_at DESC
        """,
        (patient_id, from_date, from_date, to_date, to_date),
    )
    rows = cur.fetchall()

    visits: List[Dict[str, Any]] = []
    ai_count = 0
    for row in rows:
        ai_analysis = None
        if row.get("ai_id"):
            ai_count += 1
            ai_analysis = {
                "probable_causes": _as_string_list(row.get("probable_causes")),
                "risk_level": row.get("risk_level"),
                "specialist_recommendation": row.get("specialist_recommendation"),
                "summary": row.get("summary"),
                "confidence_score": _safe_float(row.get("confidence_score")),
                "deviation_percentage": _safe_float(row.get("deviation_percentage")),
                "suggested_doctors": _as_suggested_doctors(row.get("suggested_doctors")),
                "created_at": _to_iso(row.get("ai_created_at")),
            }

        visits.append(
            {
                "visit_id": str(row["visit_id"]),
                "visit_created_at": _to_iso(row.get("visit_created_at")),
                "doctor": {
                    "id": str(row["doctor_id"]) if row.get("doctor_id") else None,
                    "full_name": row.get("doctor_name"),
                },
                "clinical_input": {
                    "symptoms": _as_string_list(row.get("symptoms")),
                    "duration": row.get("duration"),
                    "severity": row.get("severity"),
                    "vitals": row.get("vitals"),
                    "notes": row.get("notes"),
                    "doctor_diagnosis": row.get("doctor_diagnosis"),
                },
                "ai_analysis": ai_analysis,
            }
        )

    return {
        "patient": {
            "id": str(patient["id"]),
            "health_id": patient["health_id"],
            "full_name": patient["full_name"],
            "phone": patient.get("phone"),
            "age": patient.get("age"),
            "gender": patient.get("gender"),
            "created_at": _to_iso(patient.get("created_at")),
        },
        "report_period": {
            "from_date": str(from_date) if from_date else None,
            "to_date": str(to_date) if to_date else None,
            "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        },
        "totals": {
            "total_visits": len(visits),
            "total_ai_analyses": ai_count,
        },
        "visits": visits,
    }


def _escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _to_report_lines(report: Dict[str, Any]) -> List[str]:
    patient = report["patient"]
    period = report["report_period"]
    totals = report["totals"]
    visits = report["visits"]

    lines: List[str] = [
        "CareAxis CoPilot - Patient Detailed Report",
        "",
        f"Generated At: {period['generated_at']}",
        f"Report Period: {period['from_date'] or 'N/A'} to {period['to_date'] or 'N/A'}",
        "",
        "Patient Information",
        f"Name: {patient['full_name']}",
        f"Health ID: {patient['health_id']}",
        f"Patient ID: {patient['id']}",
        f"Phone: {patient['phone'] or 'N/A'}",
        f"Age/Gender: {patient['age'] if patient['age'] is not None else 'N/A'} / {patient['gender'] or 'N/A'}",
        "",
        "Summary",
        f"Total Visits: {totals['total_visits']}",
        f"Total AI Analyses: {totals['total_ai_analyses']}",
        "",
    ]

    if not visits:
        lines.append("No visits found for the selected period.")
        return lines

    for idx, visit in enumerate(visits, start=1):
        clinical = visit["clinical_input"]
        ai_analysis = visit.get("ai_analysis")

        lines.extend(
            [
                f"Visit {idx}",
                f"Visit ID: {visit['visit_id']}",
                f"Created At: {visit['visit_created_at'] or 'N/A'}",
                f"Doctor: {visit['doctor']['full_name'] or 'N/A'}",
                f"Symptoms: {', '.join(clinical['symptoms']) if clinical['symptoms'] else 'N/A'}",
                f"Duration: {clinical['duration'] or 'N/A'}",
                f"Severity: {clinical['severity'] or 'N/A'}",
                f"Doctor Diagnosis: {clinical['doctor_diagnosis'] or 'N/A'}",
                f"Clinical Notes: {clinical['notes'] or 'N/A'}",
            ]
        )

        if ai_analysis:
            lines.extend(
                [
                    "AI Analysis",
                    f"Risk Level: {ai_analysis['risk_level'] or 'N/A'}",
                    "Probable Causes: "
                    + (", ".join(ai_analysis["probable_causes"]) if ai_analysis["probable_causes"] else "N/A"),
                    f"Specialist Recommendation: {ai_analysis['specialist_recommendation'] or 'N/A'}",
                    f"Summary: {ai_analysis['summary'] or 'N/A'}",
                    f"Confidence Score: {ai_analysis['confidence_score'] if ai_analysis['confidence_score'] is not None else 'N/A'}",
                    f"Guideline Deviation (%): {ai_analysis['deviation_percentage'] if ai_analysis['deviation_percentage'] is not None else 'N/A'}",
                ]
            )

            if ai_analysis["suggested_doctors"]:
                lines.append("Suggested Doctors:")
                for doctor in ai_analysis["suggested_doctors"]:
                    lines.append(f"- {doctor['name']} ({doctor['specialty']}): {doctor['reason']}")
        else:
            lines.append("AI Analysis: Not available for this visit.")

        lines.extend(["", "-" * 95, ""])

    wrapped: List[str] = []
    for line in lines:
        if not line:
            wrapped.append("")
            continue
        wrapped.extend(textwrap.wrap(line, width=95) or [""])
    return wrapped


def _build_pdf_from_lines(lines: List[str]) -> bytes:
    max_lines_per_page = 48
    pages = [lines[i : i + max_lines_per_page] for i in range(0, len(lines), max_lines_per_page)] or [["No data"]]
    page_count = len(pages)
    font_obj_id = 3 + page_count * 2
    object_count = font_obj_id
    objects: List[bytes] = [b""] * (object_count + 1)

    objects[1] = b"<< /Type /Catalog /Pages 2 0 R >>"

    page_ids = [str(3 + idx * 2) + " 0 R" for idx in range(page_count)]
    objects[2] = (
        f"<< /Type /Pages /Kids [{' '.join(page_ids)}] /Count {page_count} >>".encode("ascii")
    )

    for idx, page_lines in enumerate(pages):
        page_obj_id = 3 + idx * 2
        content_obj_id = page_obj_id + 1

        commands = ["BT", "/F1 10 Tf", "40 770 Td"]
        for line_index, line in enumerate(page_lines):
            if line_index == 0:
                commands.append(f"({_escape_pdf_text(line)}) Tj")
            else:
                commands.append("0 -15 Td")
                commands.append(f"({_escape_pdf_text(line)}) Tj")
        commands.append("ET")
        stream = "\n".join(commands).encode("latin-1", errors="replace")

        objects[page_obj_id] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 {font_obj_id} 0 R >> >> /Contents {content_obj_id} 0 R >>".encode(
                "ascii"
            )
        )
        objects[content_obj_id] = (
            f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream"
        )

    objects[font_obj_id] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0] * (object_count + 1)

    for obj_id in range(1, object_count + 1):
        offsets[obj_id] = len(pdf)
        pdf.extend(f"{obj_id} 0 obj\n".encode("ascii"))
        pdf.extend(objects[obj_id])
        pdf.extend(b"\nendobj\n")

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {object_count + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for obj_id in range(1, object_count + 1):
        pdf.extend(f"{offsets[obj_id]:010d} 00000 n \n".encode("ascii"))

    pdf.extend(
        f"trailer\n<< /Size {object_count + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF".encode(
            "ascii"
        )
    )
    return bytes(pdf)


# ---------- SCHEMAS ----------

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    organization: str


class LoginRequest(BaseModel):
    email: str
    password: str


class PatientCreate(BaseModel):
    full_name: str
    phone: str
    age: int
    gender: str


class ClinicalRequest(BaseModel):
    symptoms: List[str]
    duration: str
    severity: str
    vitals: Dict[str, Any]
    notes: str
    doctor_diagnosis: str


class AnalyzeVisitRequest(ClinicalRequest):
    patient_id: str
    doctor_id: str


@app.on_event("startup")
def initialize_database():
    ensure_schema()


# ---------- AUTH ----------

@app.post("/auth/register")
def register(data: RegisterRequest):
    conn = get_connection()
    cur = conn.cursor()

    hashed = auth.hash_password(data.password)

    try:
        cur.execute(
            """
            INSERT INTO users (id, full_name, email, password_hash, role, organization)
            VALUES (%s, %s, %s, %s, 'doctor', %s)
            """,
            (str(uuid.uuid4()), data.full_name, data.email, hashed, data.organization)
        )
        conn.commit()
    except Exception:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

    return {"message": "Registration successful"}


@app.post("/auth/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE email = %s",
        (data.email,)
    )
    user = cur.fetchone()
    conn.close()

    if not user or not auth.verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_token(user["id"])
    return {
        "access_token": token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"]
        }
    }


# ---------- PATIENTS ----------

@app.get("/patients")
def get_patients():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, health_id, full_name, phone FROM patients")
    patients = cur.fetchall()

    conn.close()
    return {"patients": patients}


@app.post("/patients")
def create_patient(data: PatientCreate):
    conn = get_connection()
    cur = conn.cursor()

    patient_id = str(uuid.uuid4())
    health_id = f"CAX-{uuid.uuid4().hex[:6]}"

    cur.execute(
        """
        INSERT INTO patients (id, health_id, full_name, phone, age, gender)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (patient_id, health_id, data.full_name, data.phone, data.age, data.gender)
    )
    conn.commit()
    conn.close()

    return {
        "patient_id": patient_id,
        "health_id": health_id
    }


@app.get("/reports/patients/{patient_id}")
def get_patient_report(
    patient_id: str,
    from_date: Optional[str] = Query(default=None),
    to_date: Optional[str] = Query(default=None),
):
    parsed_patient_id = _parse_uuid(patient_id, "patient_id")
    parsed_from = _parse_report_date(from_date, "from_date")
    parsed_to = _parse_report_date(to_date, "to_date")

    conn = get_connection()
    try:
        return _build_patient_report_payload(conn, parsed_patient_id, parsed_from, parsed_to)
    finally:
        conn.close()


@app.get("/reports/patients/{patient_id}/pdf")
def download_patient_report_pdf(
    patient_id: str,
    from_date: Optional[str] = Query(default=None),
    to_date: Optional[str] = Query(default=None),
):
    parsed_patient_id = _parse_uuid(patient_id, "patient_id")
    parsed_from = _parse_report_date(from_date, "from_date")
    parsed_to = _parse_report_date(to_date, "to_date")

    conn = get_connection()
    try:
        report = _build_patient_report_payload(conn, parsed_patient_id, parsed_from, parsed_to)
    finally:
        conn.close()

    pdf_lines = _to_report_lines(report)
    pdf_bytes = _build_pdf_from_lines(pdf_lines)
    safe_health_id = str(report["patient"]["health_id"]).replace(" ", "_")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="patient-report-{safe_health_id}.pdf"'},
    )


# ---------- VISITS ----------

# ---------- AI ANALYSIS ----------

@app.post("/visits/analyze")
def analyze_visit(data: AnalyzeVisitRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id FROM patients WHERE id = %s", (data.patient_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")

        cur.execute("SELECT id FROM users WHERE id = %s", (data.doctor_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Doctor not found")

        visit_id = str(uuid.uuid4())
        cur.execute(
            """
            INSERT INTO visits (id, patient_id, doctor_id)
            VALUES (%s, %s, %s)
            """,
            (visit_id, data.patient_id, data.doctor_id)
        )

        # Save clinical inputs
        cur.execute(
            """
            INSERT INTO clinical_inputs
            (id, visit_id, symptoms, duration, severity, vitals, notes, doctor_diagnosis)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                visit_id,
                Json(data.symptoms),
                data.duration,
                data.severity,
                Json(data.vitals),
                data.notes,
                data.doctor_diagnosis,
            )
        )

        # Fetch patient history
        cur.execute(
            """
            SELECT a.*
            FROM ai_analysis a
            JOIN visits v ON a.visit_id = v.id
            WHERE v.patient_id = %s
            ORDER BY a.created_at DESC
            LIMIT 5
            """,
            (data.patient_id,)
        )
        history = cur.fetchall()

        # AI call
        clinical_payload = data.model_dump(exclude={"patient_id", "doctor_id"})
        ai_result = ai.analyze_case(clinical_payload, history)

        # Save AI result
        cur.execute(
            """
            INSERT INTO ai_analysis
            (id, visit_id, probable_causes, risk_level,
             specialist_recommendation, summary, confidence_score,
             deviation_percentage, suggested_doctors)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                visit_id,
                Json(ai_result["probable_causes"]),
                ai_result["risk_level"],
                ai_result["specialist_recommendation"],
                ai_result["summary"],
                ai_result["confidence_score"],
                ai_result["deviation_percentage"],
                Json(ai_result["suggested_doctors"]),
            )
        )

        conn.commit()
        return {"visit_id": visit_id, **ai_result}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to analyze visit: {exc}") from exc
    finally:
        conn.close()
