# Aarogya Orbit
**One patient. One record. One connected care journey.**

Hackathon prototype for **SIH26047 — Patient Case-Taking Software (Ministry of Ayush)**.

> ⚠️ **This is a hackathon prototype, not a certified medical device or production system.**
> The AI assistant (ORBIT) never diagnoses conditions, never prescribes medicines, and never
> replaces a doctor. It only helps organize patient-reported information for a doctor to review.

---

## 1. Tech stack (strict constraint)

Pure **HTML5 + CSS3 + Vanilla JavaScript (ES6+)**. No frameworks, no build step, no npm.

Runs by simply opening `index.html` in a modern browser, and is directly deployable to
Vercel / Netlify / GitHub Pages / Cloudflare Pages as a static site.

## 2. Project structure

```
/aarogya-orbit
├── index.html                 Landing + login + role selection
├── patient-dashboard.html     Patient home (mode switcher, quick actions, help)
├── case-taking.html           ORBIT AI conversational case-taking
├── timeline.html              Health timeline
├── appointments.html          Appointments + follow-up request
├── reports.html               Reports (simulated upload)
├── prescriptions.html         Treatment / prescription history
├── doctor-dashboard.html      Doctor's patient list + stats
├── doctor-patient.html        Doctor's case view + consultation form
├── admin-dashboard.html       Hospital admin metrics + audit log
├── device.html                Care Assistant device status
├── consent.html               Consent & privacy screen
├── settings.html              Account, theme, demo reset
│
├── css/
│   ├── style.css               Design tokens, buttons, forms, cards
│   ├── dashboard.css           App shell, sidebar, timeline, chat, ORBIT widget
│   ├── patient.css             3 patient experience modes (Junior/Youth/Classic)
│   └── responsive.css          Mobile/tablet breakpoints
│
├── js/
│   ├── data.js         Mock "database" (localStorage-backed) + seed fixtures
│   ├── auth.js         Role-based login (mock, see Security section)
│   ├── app.js          Shared shell: sidebar, toasts, modals, icons, ORBIT widget
│   ├── ai.js           ORBIT AI engine: case-taking chat, extraction, summarization
│   ├── patient.js      Patient dashboard + mode switcher + Help/Emergency
│   ├── doctor.js       Doctor dashboard + patient case view + consultation form
│   ├── appointments.js Appointments, reports, prescriptions rendering
│   ├── timeline.js     Health timeline rendering
│   └── device.js       Care Assistant device status + admin dashboard
│
└── assets/
    ├── images/ icons/ illustrations/   (placeholders — all visuals are inline SVG)
```

## 3. Setup instructions

No installation required.

1. Download / clone the folder.
2. Open `index.html` directly in a browser (double-click, or right-click → Open With → Browser).
3. To deploy: drag the folder into Netlify/Vercel's "deploy a folder" UI, or push to a GitHub repo
   and enable GitHub Pages on the `main` branch. No build command is needed.

The first time the app loads, `js/data.js` seeds a local demo dataset into the browser's
`localStorage`. Use **Settings → Reset demo data** to restore the original fixtures at any time
(handy between hackathon demo runs).

## 4. Demo credentials

| Role    | Email                                   | Password  |
|---------|------------------------------------------|-----------|
| Patient | `aarav.patient@demo.aarogyaorbit.in`     | `demo1234`|
| Patient (Youth mode) | `meera.patient@demo.aarogyaorbit.in` | `demo1234`|
| Patient (Junior mode) | `riya.patient@demo.aarogyaorbit.in` | `demo1234`|
| Doctor  | `kavita.doctor@demo.aarogyaorbit.in`     | `demo1234`|
| Doctor (Ayurveda) | `sanjay.doctor@demo.aarogyaorbit.in` | `demo1234`|
| Admin   | `admin@demo.aarogyaorbit.in`             | `demo1234`|

All accounts and medical data are **entirely fictional**, generated for this demo.

## 5. The three patient experience modes

Not labelled by raw age — chosen and switchable by the patient/guardian from the dashboard:

- **Junior Care** — ages ~5–12. Large buttons, simple language, an original space-themed
  buddy character (no copyrighted IP), voice-friendly copy.
- **Youth Mode** — teens/young adults. Retro-futuristic, fast, minimal, quick symptom selection.
- **Classic Care** — adults. Elegant, calm, high-readability, strong information hierarchy.

Switch modes any time from **Patient Dashboard → Your experience mode**.

## 6. Database schema (conceptual — implemented as a `localStorage` document store here)

```
User(id, role, name, email, passwordHash, patientId?, doctorId?)
Patient(id, name, age, gender, mode, phone, bloodGroup, assignedDoctor,
        allergies[], medications[], history[])
Doctor(id, name, specialization, system, patients[])
CaseRecord(id, patientId, doctorId, createdAt, status, chiefComplaint, duration,
           severity, location, associatedSymptoms[], aggravating, relieving,
           sleep, lifestyle, currentMedications, allergies, wellbeing,
           missingInfo[], aiSummaryId)
AISummary(id, caseId, generatedAt, text)
Prescription(id, patientId, doctorId, caseId, date, system, diagnosis,
             treatmentPlan, investigations[], followUpDate, notes)
MedicalReport(id, patientId, name, type, date, url)
Appointment(id, patientId, doctorId, date, time, type, status)
HealthTimelineEvent(patientId → [{date, title, desc}])
Device(id, name, patientId, status, battery, nextReminder)
Consent(patientId → {given, date})
AuditLog(id, actor, action, target, time)
```

Relationships: Patient 1—N CaseRecord, Patient 1—N Appointment/Report/Prescription,
Patient 1—1 Device, Doctor 1—N Patient (assignment), CaseRecord 1—1 AISummary.

In a production build this becomes a real relational (PostgreSQL) or document (MongoDB)
schema behind a REST/GraphQL API — the shape above maps directly onto SQL tables or
collections without redesign.

## 7. API design (for the future backend)

The frontend already calls a single abstraction point for AI (`callAI()` in `js/ai.js`) and
is structured so every `AO.*` data call in `js/data.js` can be swapped for a `fetch()` to:

```
POST   /api/auth/login
GET    /api/patients/:id
GET    /api/patients/:id/timeline
POST   /api/cases                     (create case record from case-taking)
POST   /api/ai/summarize              (doctor-facing summary generation)
GET    /api/doctors/:id/patients
POST   /api/consultations             (doctor records diagnosis/treatment)
POST   /api/appointments
GET    /api/devices/:patientId
POST   /api/consent
GET    /api/audit-log
```

## 8. AI architecture & safety

- `js/ai.js` defines `AO_CASE_QUESTIONS` (the structured case-taking script), a light
  rule-based `aoExtractField()` for turning free text into structured fields, and
  `aoDetectUrgent()` for a keyword-based safety net.
- **`callAI(task, payload)`** is the single integration point. In this prototype it returns
  local mock responses (`aoMockAIResponse`) so the whole app works offline with zero setup.
  To connect a real LLM: point `window.AO_AI_CONFIG = { provider: "custom", baseUrl: "..." }`
  at **your own backend/serverless proxy** — never call a model provider directly from the
  browser, and never place `AI_API_KEY` in frontend code. Configure the real provider on the
  server using environment variables:
  ```
  AI_API_KEY=
  AI_MODEL=
  AI_BASE_URL=
  ```
- **Hard safety rules enforced in the UI/copy:** ORBIT never states a diagnosis or medicine
  name. If a message contains urgent-symptom keywords (e.g. chest pain, breathing difficulty),
  the UI shows a generic safety message directing the patient to hospital staff or emergency
  services — it never assigns a cause. Every AI-generated summary is labeled **"AI-generated
  summary — verify before clinical use"** and the doctor must submit a separate, doctor-authored
  consultation and diagnosis before any prescription is recorded.

## 9. Security considerations

Implemented in this prototype:
- Role-based access control: each `AoSession.requireRole([...])` gate redirects unauthorized
  roles away from a page.
- Separate accounts per role — no shared patient/doctor credentials.
- Doctors only see patients in their own `assignedDoctor` / `doctors[].patients` list.
- Every meaningful action (login, case submission, consultation, consent change, report
  upload, help trigger) writes to an `AuditLog`.
- Consent screen with plain-language explanation and an explicit opt-in checkbox.
- Data minimization: the AI layer only ever receives the fields relevant to summarization,
  not the full patient record.

Documented for a production build (not implemented client-side, by design):
- Real authentication must happen server-side with hashed passwords (bcrypt/argon2) and
  signed, short-lived session tokens (JWT or server sessions) — plaintext demo passwords
  and client-side-only login in this prototype exist purely for hackathon judging.
- TLS everywhere (encryption in transit); encryption at rest for the database and any
  file storage (reports).
- Secrets (`AI_API_KEY`, DB credentials) live only in server-side environment variables,
  never shipped to the browser.
- Session timeout / auto-logout and CSRF protection on any real backend.
- Input validation and output encoding on every API boundary.

## 10. Device integration architecture

`device.html` / `js/device.js` render a **Device Status** panel (online/offline, battery,
next reminder) sourced from the same data layer as everything else. The architecture is
built so a real Care Assistant device (ESP32 / Raspberry Pi, or a phone acting as a bridge)
would:

1. Authenticate with a device-specific token (not a user password).
2. Poll or subscribe (MQTT/WebSocket) to `/api/devices/:id/reminders`.
3. Push simple events back (`check-in`, `help-pressed`, `reminder-acknowledged`) to
   `/api/devices/:id/events`, which append to the same `AuditLog`/`Notification` model.
4. Never receive or store full case records — only the minimum (next reminder text,
   patient first name) needed to do its job, per the data-minimization principle.

## 11. 3-minute hackathon demo script

1. **(0:00–0:20)** Landing page — explain the tagline and the SIH26047 problem statement.
2. **(0:20–0:50)** Log in as **Aarav Mehta** (patient). Show the 3 experience modes; switch
   to Junior Care briefly to show Orbie the space buddy, then back to Classic Care.
3. **(0:50–1:40)** Click **Start Health Check** → have a short conversation with ORBIT
   (headache, 3 days, severity 6, screen time). Show the AI summary card with the
   "verify before clinical use" label, then submit the case.
4. **(1:40–2:10)** Log out, log in as **Dr. Kavita Rao**. Open Aarav's case, show the AI
   summary flagged for review, fill in diagnosis + treatment plan + follow-up date, save.
5. **(2:10–2:30)** Log back in as Aarav — show the new entry in **Treatment** and
   **Health Timeline**, and the new follow-up in **Appointments**.
6. **(2:30–2:50)** Log in as **Admin** — show hospital-wide metrics, the audit log, and the
   **Device Status** page (Care Assistant companion online, battery, next reminder).
7. **(2:50–3:00)** Close on the AYUSH angle: reopen Meera Nair's case (Dr. Sanjay Iyer,
   Ayurveda) to show the system tag and Ayurveda-specific treatment plan.

## 12. Key USP

- A **single connected record** spans modern medicine and AYUSH systems, instead of siloed
  paper case sheets per visit.
- **ORBIT** turns unstructured patient conversation into structured, doctor-ready fields
  without ever crossing into diagnosis — doctors stay the final decision-makers.
- **Three genuinely different experience modes** (not just a font-size toggle) make
  case-taking usable for a 7-year-old, a stressed exam-season teen, and an adult patient alike.
- Built to be **hardware-ready**: the Device Status model is designed so a real ESP32/
  Raspberry Pi companion can be dropped in without changing the data model.

## 13. Future scalability plan

- Swap `js/data.js`'s localStorage store for real REST/GraphQL calls against a Postgres +
  object-storage backend (schema above maps directly).
- Replace `aoMockAIResponse()` with a real LLM call through a server-side proxy, with
  retrieval over the patient's structured history for better summaries.
- Add real-time updates (WebSocket) so a doctor's dashboard updates the moment a patient
  submits a case, and a device receives a reminder the moment a follow-up is booked.
- Multi-hospital tenancy: extend `Hospital` as a first-class entity above `Doctor`/`Patient`.
- Native mobile wrapper (same static frontend) for offline-first rural clinic usage.

---

*Demo environment — not for real patient data. Built for Smart India Hackathon (SIH26047).*
