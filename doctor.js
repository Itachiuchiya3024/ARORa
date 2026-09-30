/* =========================================================
   Aarogya Orbit — Doctor Dashboard Logic
   ========================================================= */

function aoRenderDoctorDashboard(){
  const session = AoSession.requireRole(["doctor"]);
  if(!session) return;
  aoRenderShell("dashboard");

  const doctor = AO.getDoctor(session.doctorId);
  const cases = AO.getCasesForDoctor(session.doctorId);
  const patientIds = doctor ? doctor.patients : [];

  const statsEl = document.getElementById("doc-stats");
  if(statsEl){
    const openCases = cases.filter(c => c.status !== "closed").length;
    statsEl.innerHTML = `
      <div class="card stat-card"><div class="stat-value">${patientIds.length}</div><div class="stat-label">Assigned patients</div></div>
      <div class="card stat-card"><div class="stat-value">${cases.length}</div><div class="stat-label">Total case records</div></div>
      <div class="card stat-card"><div class="stat-value">${openCases}</div><div class="stat-label">Awaiting review</div></div>
      <div class="card stat-card"><div class="stat-value">${AO.db().appointments.filter(a=>a.doctorId===session.doctorId).length}</div><div class="stat-label">Appointments</div></div>
    `;
  }

  const search = document.getElementById("patient-search");
  function renderPatientList(filter){
    const list = document.getElementById("doc-patient-list");
    if(!list) return;
    const patients = patientIds.map(id => AO.getPatient(id)).filter(p => p &&
      (!filter || p.name.toLowerCase().includes(filter.toLowerCase())));
    list.innerHTML = patients.length ? patients.map(p => {
      const initials = p.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
      const lastCase = AO.getCasesForPatient(p.id).slice(-1)[0];
      return `
        <div class="list-row" style="cursor:pointer;" data-patient="${p.id}">
          <div class="avatar" style="background:${p.avatarColor}">${initials}</div>
          <div>
            <div class="row-title">${p.name}</div>
            <div class="row-sub">${p.age} yrs · ${p.gender}${lastCase ? " · " + lastCase.chiefComplaint : ""}</div>
          </div>
          <div class="row-meta"><span class="badge badge-accent">${lastCase ? lastCase.status : "No case"}</span></div>
        </div>`;
    }).join("") : aoEmptyState("No patients match your search.");

    list.querySelectorAll("[data-patient]").forEach(row => {
      row.addEventListener("click", () => {
        window.location.href = "doctor-patient.html?patient=" + row.dataset.patient;
      });
    });
  }
  renderPatientList("");
  if(search) search.addEventListener("input", () => renderPatientList(search.value));
}

function aoGetQueryParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function aoRenderDoctorPatientView(){
  const session = AoSession.requireRole(["doctor"]);
  if(!session) return;
  aoRenderShell("dashboard");

  const patientId = aoGetQueryParam("patient");
  const patient = AO.getPatient(patientId);
  const header = document.getElementById("dpv-header");
  if(!patient){
    document.getElementById("dpv-content").innerHTML = aoEmptyState("Patient not found.");
    return;
  }
  const initials = patient.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  if(header){
    header.innerHTML = `
      <div class="avatar" style="width:56px;height:56px;font-size:1.2rem;background:${patient.avatarColor}">${initials}</div>
      <div>
        <h2 style="margin-bottom:2px;">${patient.name}</h2>
        <div class="text-muted">${patient.age} yrs · ${patient.gender} · Blood group ${patient.bloodGroup}</div>
      </div>
    `;
  }

  const cases = AO.getCasesForPatient(patientId);
  const latestCase = cases[cases.length - 1];

  const historyEl = document.getElementById("dpv-history");
  if(historyEl){
    historyEl.innerHTML = `
      <p><strong>Known history:</strong> ${patient.history.length ? patient.history.join(", ") : "None recorded"}</p>
      <p><strong>Current medications:</strong> ${patient.medications.length ? patient.medications.join(", ") : "None recorded"}</p>
      <p><strong>Allergies:</strong> ${patient.allergies.length ? patient.allergies.join(", ") : "None recorded"}</p>
    `;
  }

  const summaryEl = document.getElementById("dpv-ai-summary");
  if(summaryEl){
    if(latestCase){
      const summary = AO.getSummary(latestCase.aiSummaryId);
      summaryEl.innerHTML = `
        <div class="badge badge-warn" style="margin-bottom:10px;">AI-generated summary — verify before clinical use</div>
        <p>${summary ? summary.text : aoBuildSummaryText(latestCase)}</p>
        ${latestCase.missingInfo && latestCase.missingInfo.length ? `<p class="text-muted"><strong>Missing information:</strong> ${latestCase.missingInfo.join(", ")}</p>` : ""}
      `;
    } else {
      summaryEl.innerHTML = aoEmptyState("No case record submitted yet.");
    }
  }

  const caseDetailEl = document.getElementById("dpv-case-detail");
  if(caseDetailEl && latestCase){
    caseDetailEl.innerHTML = `
      <div class="grid grid-2">
        <div><strong>Chief complaint</strong><p>${latestCase.chiefComplaint}</p></div>
        <div><strong>Duration</strong><p>${latestCase.duration}</p></div>
        <div><strong>Severity</strong><p>${latestCase.severity}/10</p></div>
        <div><strong>Location</strong><p>${latestCase.location}</p></div>
        <div><strong>Associated symptoms</strong><p>${(latestCase.associatedSymptoms||[]).join(", ") || "—"}</p></div>
        <div><strong>Sleep</strong><p>${latestCase.sleep || "—"}</p></div>
      </div>
    `;
  }

  const timelineEl = document.getElementById("dpv-timeline");
  if(timelineEl){
    const events = AO.getTimelineForPatient(patientId);
    timelineEl.innerHTML = events.length ? `<div class="timeline">${events.map(e => `
      <div class="timeline-item"><div class="t-date">${aoFormatDate(e.date)}</div><div class="t-title">${e.title}</div><div class="t-desc">${e.desc}</div></div>
    `).join("")}</div>` : aoEmptyState("No timeline events yet.");
  }

  const rxHistEl = document.getElementById("dpv-rx-history");
  if(rxHistEl){
    const rx = AO.getPrescriptionsForPatient(patientId);
    rxHistEl.innerHTML = rx.length ? rx.map(r => `
      <div class="card-flat" style="margin-bottom:10px;">
        <span class="badge badge-gold">${r.system}</span>
        <p style="margin:6px 0 2px;"><strong>${r.diagnosis}</strong></p>
        <p class="text-muted" style="font-size:.85rem;">${aoFormatDate(r.date)} · ${r.treatmentPlan}</p>
      </div>
    `).join("") : aoEmptyState("No prior treatment on record.");
  }

  const form = document.getElementById("consultation-form");
  if(form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const diagnosis = document.getElementById("cf-diagnosis").value.trim();
      const plan = document.getElementById("cf-plan").value.trim();
      const system = document.getElementById("cf-system").value;
      const investigations = document.getElementById("cf-investigations").value.trim();
      const followUp = document.getElementById("cf-followup").value;
      const notes = document.getElementById("cf-notes").value.trim();
      if(!diagnosis || !plan){ aoToast("Diagnosis and treatment plan are required.", "error"); return; }

      const db = AO.db();
      const newRx = {
        id: "rx_" + Date.now(), patientId, doctorId: session.doctorId,
        caseId: latestCase ? latestCase.id : null, date: new Date().toISOString().slice(0,10),
        system, diagnosis, treatmentPlan: plan,
        investigations: investigations ? investigations.split(",").map(s=>s.trim()) : [],
        followUpDate: followUp || null, notes
      };
      db.prescriptions.push(newRx);
      if(latestCase){
        const c = db.caseRecords.find(c => c.id === latestCase.id);
        if(c) c.status = "closed";
      }
      db.timeline[patientId] = db.timeline[patientId] || [];
      db.timeline[patientId].push({ date: newRx.date, title: "Doctor consultation", desc: `${session.name} reviewed the case.` });
      db.timeline[patientId].push({ date: newRx.date, title: "Treatment prescribed", desc: diagnosis });
      if(followUp){
        db.appointments.push({ id: "ap_" + Date.now(), patientId, doctorId: session.doctorId, date: followUp, time: "TBD", type: "Follow-up", status: "upcoming" });
        db.timeline[patientId].push({ date: followUp, title: "Follow-up scheduled", desc: "Upcoming follow-up visit." });
      }
      AO.save(db);
      AO.log(session.name, "Recorded consultation & treatment", patient.name);
      aoToast("Consultation saved. Patient record updated.", "success");
      form.reset();
      aoRenderDoctorPatientView();
    });
  }
}
