/* =========================================================
   Aarogya Orbit — Care Assistant Device + Admin Dashboard
   ========================================================= */

function aoRenderDevicePage(){
  const session = AoSession.requireRole(["admin", "doctor"]);
  if(!session) return;
  aoRenderShell("device");

  const devices = AO.db().devices;
  const container = document.getElementById("device-list");
  if(!container) return;

  container.innerHTML = devices.length ? devices.map(d => {
    const patient = AO.getPatient(d.patientId);
    return `
      <div class="card device-card" style="margin-bottom:16px;">
        <div class="device-dot ${d.status}"></div>
        <div style="flex:1;">
          <div class="row-title">${d.name}</div>
          <div class="row-sub">Assigned to ${patient ? patient.name : "Unassigned"}</div>
        </div>
        <div style="text-align:center; min-width:90px;">
          <div class="text-muted" style="font-size:.78rem;">Battery</div>
          <div class="battery-bar"><div style="width:${d.battery}%"></div></div>
          <div style="font-size:.8rem;">${d.battery}%</div>
        </div>
        <div style="min-width:190px; text-align:right;">
          <div class="text-muted" style="font-size:.78rem;">Next reminder</div>
          <div>${d.nextReminder}</div>
        </div>
        <span class="badge ${d.status === 'online' ? 'badge-success' : 'badge-muted'}">${d.status}</span>
      </div>
    `;
  }).join("") : aoEmptyState("No companion devices registered yet.");
}

function aoRenderAdminDashboard(){
  const session = AoSession.requireRole(["admin"]);
  if(!session) return;
  aoRenderShell("dashboard");

  const db = AO.db();
  const statsEl = document.getElementById("admin-stats");
  if(statsEl){
    const today = new Date().toISOString().slice(0,10);
    statsEl.innerHTML = `
      <div class="card stat-card"><div class="stat-value">${db.patients.length}</div><div class="stat-label">Registered patients</div></div>
      <div class="card stat-card"><div class="stat-value">${db.caseRecords.length}</div><div class="stat-label">Active cases</div></div>
      <div class="card stat-card"><div class="stat-value">${db.appointments.filter(a=>a.status==='upcoming').length}</div><div class="stat-label">Pending follow-ups</div></div>
      <div class="card stat-card"><div class="stat-value">${db.caseRecords.length}</div><div class="stat-label">AI-assisted case forms</div></div>
      <div class="card stat-card"><div class="stat-value">${db.devices.filter(d=>d.status==='online').length}/${db.devices.length}</div><div class="stat-label">Connected devices</div></div>
      <div class="card stat-card"><div class="stat-value">${db.doctors.length}</div><div class="stat-label">Active doctors</div></div>
    `;
  }

  const doctorsEl = document.getElementById("admin-doctors");
  if(doctorsEl){
    doctorsEl.innerHTML = db.doctors.map(d => `
      <div class="list-row">
        <div class="avatar" style="background:var(--accent)">${AoIcon.user}</div>
        <div>
          <div class="row-title">${d.name}</div>
          <div class="row-sub">${d.specialization} · ${d.system}</div>
        </div>
        <div class="row-meta"><span class="badge badge-accent">${d.patients.length} patients</span></div>
      </div>
    `).join("");
  }

  const auditEl = document.getElementById("admin-audit-log");
  if(auditEl){
    auditEl.innerHTML = db.auditLog.slice(0, 12).map(l => `
      <div class="list-row">
        <div>
          <div class="row-title">${l.action}</div>
          <div class="row-sub">${l.actor} → ${l.target}</div>
        </div>
        <div class="row-meta text-muted" style="font-size:.8rem;">${new Date(l.time).toLocaleString("en-IN")}</div>
      </div>
    `).join("");
  }
}
