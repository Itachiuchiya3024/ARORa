/* =========================================================
   Aarogya Orbit — Demo Data Layer
   ---------------------------------------------------------
   This is a HACKATHON PROTOTYPE. There is no real backend.
   All "database" state lives in localStorage under the key
   AO_DB and is seeded once from the fixtures below.

   In a production build, everything in this file would be
   replaced by real API calls (see js/ai.js callAI() for the
   abstraction pattern to follow).
   ========================================================= */

const AO_DB_KEY = "AO_DB_v1";

const AO_SEED = {
  meta: {
    seededAt: null,
    demoNotice: "Demo environment — not for real patient data."
  },

  users: [
    { id: "u_patient_1", role: "patient", name: "Aarav Mehta", email: "aarav.patient@demo.aarogyaorbit.in", password: "demo1234", patientId: "p1" },
    { id: "u_patient_2", role: "patient", name: "Meera Nair", email: "meera.patient@demo.aarogyaorbit.in", password: "demo1234", patientId: "p2" },
    { id: "u_patient_3", role: "patient", name: "Little Riya", email: "riya.patient@demo.aarogyaorbit.in", password: "demo1234", patientId: "p3" },
    { id: "u_doctor_1", role: "doctor", name: "Dr. Kavita Rao", email: "kavita.doctor@demo.aarogyaorbit.in", password: "demo1234", doctorId: "d1" },
    { id: "u_doctor_2", role: "doctor", name: "Dr. Sanjay Iyer (Ayurveda)", email: "sanjay.doctor@demo.aarogyaorbit.in", password: "demo1234", doctorId: "d2" },
    { id: "u_admin_1", role: "admin", name: "Hospital Admin", email: "admin@demo.aarogyaorbit.in", password: "demo1234" }
  ],

  patients: [
    {
      id: "p1", name: "Aarav Mehta", age: 34, gender: "Male", mode: "classic",
      phone: "+91 98xxxxxx01", bloodGroup: "B+", assignedDoctor: "d1",
      allergies: ["Dust", "Penicillin"], medications: ["Metformin 500mg"],
      history: ["Type 2 Diabetes (2022)"], avatarColor: "#5B6EF5"
    },
    {
      id: "p2", name: "Meera Nair", age: 19, gender: "Female", mode: "youth",
      phone: "+91 98xxxxxx02", bloodGroup: "O+", assignedDoctor: "d2",
      allergies: [], medications: [], history: ["Seasonal migraine episodes"], avatarColor: "#E8A33D"
    },
    {
      id: "p3", name: "Riya", age: 7, gender: "Female", mode: "junior",
      phone: "+91 98xxxxxx03", bloodGroup: "A+", assignedDoctor: "d1",
      allergies: ["Peanuts"], medications: [], history: [], avatarColor: "#2FAE7B"
    }
  ],

  doctors: [
    { id: "d1", name: "Dr. Kavita Rao", specialization: "General Medicine", system: "Modern Medicine", patients: ["p1", "p3"] },
    { id: "d2", name: "Dr. Sanjay Iyer", specialization: "Ayurveda Physician", system: "Ayurveda", patients: ["p2"] }
  ],

  caseRecords: [
    {
      id: "cr1", patientId: "p1", doctorId: "d1", createdAt: "2026-08-12T09:20:00",
      status: "closed",
      chiefComplaint: "Frequent headaches",
      duration: "3 days",
      severity: 6,
      location: "Forehead, both sides",
      associatedSymptoms: ["Mild nausea", "Sensitivity to light"],
      aggravating: "Screen time, lack of sleep",
      relieving: "Rest in a dark room",
      sleep: "5-6 hours, irregular",
      lifestyle: "High screen time, skips breakfast often",
      currentMedications: "Metformin 500mg",
      allergies: "Dust, Penicillin",
      wellbeing: "Reports work-related stress",
      missingInfo: ["Family history of migraine not confirmed"],
      aiSummaryId: "as1"
    },
    {
      id: "cr2", patientId: "p2", doctorId: "d2", createdAt: "2026-08-20T14:00:00",
      status: "closed",
      chiefComplaint: "Recurring migraine-like episodes",
      duration: "2 weeks",
      severity: 7,
      location: "Right temple",
      associatedSymptoms: ["Nausea", "Light sensitivity"],
      aggravating: "Exam stress, poor sleep",
      relieving: "Herbal tea, dark room",
      sleep: "4-5 hours during exams",
      lifestyle: "Irregular meals, high caffeine",
      currentMedications: "None",
      allergies: "None reported",
      wellbeing: "Exam-related anxiety mentioned",
      missingInfo: [],
      aiSummaryId: "as2"
    }
  ],

  aiSummaries: [
    {
      id: "as1", caseId: "cr1",
      generatedAt: "2026-08-12T09:32:00",
      text: "Chief complaint: Headache, bilateral, 3 days. Patient-reported severity 6/10. Associated symptoms include mild nausea and light sensitivity. Aggravated by screen time and poor sleep; relieved by rest. Sleep pattern irregular (5-6 hrs). Currently on Metformin 500mg for known Type 2 Diabetes. Known allergies: dust, penicillin. Patient mentioned work-related stress. Family history of migraine not confirmed — consider asking at consultation."
    },
    {
      id: "as2", caseId: "cr2",
      generatedAt: "2026-08-20T14:10:00",
      text: "Chief complaint: Recurring right-temple headache, migraine-like, 2 weeks. Severity 7/10. Associated nausea and light sensitivity. Aggravated by exam stress and poor sleep; relieved by herbal tea and rest. Sleep reduced to 4-5 hrs during exam period. No current medication. No known allergies reported. Patient mentioned exam-related anxiety."
    }
  ],

  prescriptions: [
    {
      id: "rx1", patientId: "p1", doctorId: "d1", caseId: "cr1", date: "2026-08-12",
      system: "Modern Medicine",
      diagnosis: "Tension-type headache (clinical impression, to be reviewed)",
      treatmentPlan: "Hydration, sleep hygiene, reduced screen time. Paracetamol 500mg SOS for pain.",
      investigations: ["CBC (routine)"],
      followUpDate: "2026-08-30",
      notes: "Advise stress management. Reassess if headaches persist beyond 2 weeks."
    },
    {
      id: "rx2", patientId: "p2", doctorId: "d2", caseId: "cr2", date: "2026-08-20",
      system: "Ayurveda",
      diagnosis: "Vata-Pitta imbalance presentation (clinical impression, to be reviewed)",
      treatmentPlan: "Shirodhara sessions (2x/week), Brahmi Ghrita at night, dietary regulation, sleep schedule correction.",
      investigations: [],
      followUpDate: "2026-09-05",
      notes: "Recommend yoga nidra before exams; reassess after 2 weeks."
    }
  ],

  reports: [
    { id: "rep1", patientId: "p1", name: "CBC Report - Aug 2026", type: "Lab", date: "2026-08-14", url: "#" },
    { id: "rep2", patientId: "p2", name: "Sleep Pattern Log", type: "Self-reported", date: "2026-08-19", url: "#" }
  ],

  appointments: [
    { id: "ap1", patientId: "p1", doctorId: "d1", date: "2026-09-14", time: "11:00 AM", type: "Follow-up", status: "upcoming" },
    { id: "ap2", patientId: "p2", doctorId: "d2", date: "2026-09-05", time: "4:30 PM", type: "Follow-up", status: "upcoming" },
    { id: "ap3", patientId: "p3", doctorId: "d1", date: "2026-09-18", time: "10:00 AM", type: "General checkup", status: "upcoming" }
  ],

  timeline: {
    p1: [
      { date: "2026-08-12", title: "First consultation", desc: "Case-taking completed via ORBIT AI." },
      { date: "2026-08-14", title: "Lab report uploaded", desc: "CBC Report uploaded by patient." },
      { date: "2026-08-16", title: "Doctor consultation", desc: "Dr. Kavita Rao reviewed the case." },
      { date: "2026-08-16", title: "Treatment prescribed", desc: "Tension-type headache management plan started." },
      { date: "2026-09-14", title: "Follow-up scheduled", desc: "Upcoming follow-up visit." }
    ],
    p2: [
      { date: "2026-08-20", title: "First consultation", desc: "Case-taking completed via ORBIT AI." },
      { date: "2026-08-20", title: "Doctor consultation", desc: "Dr. Sanjay Iyer (Ayurveda) reviewed the case." },
      { date: "2026-08-20", title: "Treatment prescribed", desc: "Ayurveda care plan (Shirodhara + diet) started." },
      { date: "2026-09-05", title: "Follow-up scheduled", desc: "Upcoming follow-up visit." }
    ],
    p3: [
      { date: "2026-09-01", title: "Profile created", desc: "Junior Care profile set up by guardian." },
      { date: "2026-09-18", title: "Checkup scheduled", desc: "Upcoming general checkup." }
    ]
  },

  devices: [
    { id: "dev1", name: "Orbit Companion #01", patientId: "p1", status: "online", battery: 82, nextReminder: "6:30 PM — Take Metformin" },
    { id: "dev2", name: "Orbit Companion #02", patientId: "p2", status: "offline", battery: 41, nextReminder: "No reminders queued" }
  ],

  auditLog: [
    { id: "log1", actor: "Dr. Kavita Rao", action: "Viewed case record", target: "Aarav Mehta — cr1", time: "2026-08-16T10:02:00" },
    { id: "log2", actor: "ORBIT AI", action: "Generated case summary", target: "cr1", time: "2026-08-12T09:32:00" },
    { id: "log3", actor: "Aarav Mehta", action: "Uploaded report", target: "CBC Report", time: "2026-08-14T08:15:00" }
  ],

  consent: {
    p1: { given: true, date: "2026-08-12" },
    p2: { given: true, date: "2026-08-20" },
    p3: { given: true, date: "2026-09-01" }
  }
};

function aoLoadDB() {
  const raw = localStorage.getItem(AO_DB_KEY);
  if (!raw) {
    const fresh = JSON.parse(JSON.stringify(AO_SEED));
    fresh.meta.seededAt = new Date().toISOString();
    localStorage.setItem(AO_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("AO_DB corrupted, reseeding", e);
    localStorage.removeItem(AO_DB_KEY);
    return aoLoadDB();
  }
}

function aoSaveDB(db) {
  localStorage.setItem(AO_DB_KEY, JSON.stringify(db));
}

function aoResetDB() {
  localStorage.removeItem(AO_DB_KEY);
  return aoLoadDB();
}

function aoAddAuditLog(actor, action, target) {
  const db = aoLoadDB();
  db.auditLog.unshift({
    id: "log_" + Date.now(),
    actor, action, target,
    time: new Date().toISOString()
  });
  aoSaveDB(db);
}

/* Convenience getters */
const AO = {
  db: () => aoLoadDB(),
  save: aoSaveDB,
  reset: aoResetDB,
  log: aoAddAuditLog,
  getPatient: (id) => aoLoadDB().patients.find(p => p.id === id),
  getDoctor: (id) => aoLoadDB().doctors.find(d => d.id === id),
  getCasesForPatient: (id) => aoLoadDB().caseRecords.filter(c => c.patientId === id),
  getCasesForDoctor: (id) => aoLoadDB().caseRecords.filter(c => c.doctorId === id),
  getAppointmentsForPatient: (id) => aoLoadDB().appointments.filter(a => a.patientId === id),
  getPrescriptionsForPatient: (id) => aoLoadDB().prescriptions.filter(r => r.patientId === id),
  getReportsForPatient: (id) => aoLoadDB().reports.filter(r => r.patientId === id),
  getTimelineForPatient: (id) => (aoLoadDB().timeline[id] || []),
  getDeviceForPatient: (id) => aoLoadDB().devices.find(d => d.patientId === id),
  getSummary: (id) => aoLoadDB().aiSummaries.find(s => s.id === id)
};
