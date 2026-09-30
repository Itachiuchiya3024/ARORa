/* =========================================================
   Aarogya Orbit — Appointments / Reports / Prescriptions
   ========================================================= */

function aoRenderAppointmentsPage(){
  const session = AoSession.requireRole(["patient"]);
  if(!session) return;
  aoApplyStoredMode();
  aoRenderShell("appointments");

  const appts = AO.getAppointmentsForPatient(session.patientId);
  const container = document.getElementById("appointments-list");
  if(!container) return;

  if(!appts.length){
    container.innerHTML = aoEmptyState("No appointments yet. Request a follow-up after your next visit.");
  } else {
    container.innerHTML = appts.map(a => {
      const doc = AO.getDoctor(a.doctorId);
      return `
        <div class="list-row">
          <div class="avatar" style="background:var(--accent)">${AoIcon.calendar}</div>
          <div>
            <div class="row-title">${a.type}</div>
            <div class="row-sub">${doc ? doc.name : "Unassigned"} · ${doc ? doc.system : ""}</div>
          </div>
          <div class="row-meta">
            <div class="row-title">${aoFormatDate(a.date)}</div>
            <div class="row-sub">${a.time}</div>
            <span class="badge ${a.status === 'upcoming' ? 'badge-accent' : 'badge-muted'}">${a.status}</span>
          </div>
        </div>`;
    }).join("");
  }

  const form = document.getElementById("request-followup-form");
  if(form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const date = document.getElementById("fu-date").value;
      const reason = document.getElementById("fu-reason").value.trim();
      if(!date || !reason){ aoToast("Please choose a date and reason.", "error"); return; }
      const db = AO.db();
      const patient = AO.getPatient(session.patientId);
      db.appointments.push({
        id: "ap_" + Date.now(), patientId: session.patientId, doctorId: patient.assignedDoctor,
        date, time: "TBD", type: "Follow-up (requested): " + reason, status: "upcoming"
      });
      AO.save(db);
      AO.log(session.name, "Requested follow-up appointment", reason);
      aoToast("Follow-up request sent to your doctor's schedule.", "success");
      form.reset();
      aoRenderAppointmentsPage();
    });
  }

  aoInitOrbitWidget("appointments");
}

function aoRenderReportsPage(){
  const session = AoSession.requireRole(["patient"]);
  if(!session) return;
  aoApplyStoredMode();
  aoRenderShell("reports");

  const reports = AO.getReportsForPatient(session.patientId);
  const container = document.getElementById("reports-list");
  if(container){
    container.innerHTML = reports.length ? reports.map(r => `
      <div class="list-row">
        <div class="avatar" style="background:var(--gold)">${AoIcon.file}</div>
        <div>
          <div class="row-title">${r.name}</div>
          <div class="row-sub">${r.type} · Uploaded ${aoFormatDate(r.date)}</div>
        </div>
        <div class="row-meta"><a href="${r.url}" class="btn btn-sm btn-secondary">View</a></div>
      </div>
    `).join("") : aoEmptyState("No reports uploaded yet.");
  }

  const uploadForm = document.getElementById("upload-report-form");
  if(uploadForm){
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("report-name").value.trim();
      if(!name){ aoToast("Please enter a report name.", "error"); return; }
      const db = AO.db();
      db.reports.push({ id: "rep_" + Date.now(), patientId: session.patientId, name, type: "Uploaded", date: new Date().toISOString().slice(0,10), url: "#" });
      db.timeline[session.patientId] = db.timeline[session.patientId] || [];
      db.timeline[session.patientId].push({ date: new Date().toISOString().slice(0,10), title: "Report uploaded", desc: name });
      AO.save(db);
      AO.log(session.name, "Uploaded report", name);
      aoToast("Report added (simulated upload).", "success");
      uploadForm.reset();
      aoRenderReportsPage();
    });
  }

  aoInitOrbitWidget("reports");
}

function aoRenderPrescriptionsPage(){
  const session = AoSession.requireRole(["patient"]);
  if(!session) return;
  aoApplyStoredMode();
  aoRenderShell("prescriptions");

  const rx = AO.getPrescriptionsForPatient(session.patientId);
  const container = document.getElementById("rx-list");
  if(container){
    container.innerHTML = rx.length ? rx.map(r => `
      <div class="card" style="margin-bottom:16px;">
        <div class="flex justify-between items-center" style="margin-bottom:8px;">
          <span class="badge badge-gold">${r.system}</span>
          <span class="text-muted" style="font-size:.82rem;">${aoFormatDate(r.date)}</span>
        </div>
        <h3>${r.diagnosis}</h3>
        <p><strong>Treatment plan:</strong> ${r.treatmentPlan}</p>
        ${r.investigations && r.investigations.length ? `<p><strong>Investigations:</strong> ${r.investigations.join(", ")}</p>` : ""}
        <p><strong>Doctor's notes:</strong> ${r.notes}</p>
        <p class="text-muted" style="font-size:.85rem;">Follow-up: ${aoFormatDate(r.followUpDate)}</p>
      </div>
    `).join("") : aoEmptyState("No treatment records yet.");
  }
  aoInitOrbitWidget("prescriptions");
}
