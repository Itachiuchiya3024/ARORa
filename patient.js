/* =========================================================
   Aarogya Orbit — Patient Dashboard Logic
   ========================================================= */

function aoRenderModeSwitcher(containerId){
  const session = AoSession.get();
  const modes = [
    { key:"junior", title:"Junior Care", emoji:"🚀", desc:"For kids ~5–12. Bright colors, big bouncy buttons, Orbie the space buddy." },
    { key:"youth", title:"Youth Mode", emoji:"⚡", desc:"For teens & young adults. Neon glass, 3D tilt cards, that Gen-Z energy." },
    { key:"classic", title:"Classic Care", emoji:"✦", desc:"For adults. Calm, gold-accented, elegant depth, easy to read." }
  ];
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = modes.map(m => `
    <button class="mode-option ${session.mode === m.key ? 'active' : ''}" data-mode="${m.key}">
      <div class="mo-title"><span class="mo-emoji">${m.emoji}</span> ${m.title}</div>
      <div class="mo-desc">${m.desc}</div>
    </button>
  `).join("");
  el.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      aoSetPatientMode(btn.dataset.mode);
      document.body.className = document.body.className.replace(/mode-\w+/g, "") + " mode-" + btn.dataset.mode;
      aoRenderModeSwitcher(containerId);
      aoToast("Switched to " + btn.querySelector(".mo-title").textContent, "success");
    });
  });
}

function aoRenderPatientDashboard(){
  const session = AoSession.requireRole(["patient"]);
  if(!session) return;
  aoApplyStoredMode();
  aoRenderShell("dashboard");

  const patient = AO.getPatient(session.patientId);
  const appts = AO.getAppointmentsForPatient(session.patientId).filter(a => a.status === "upcoming");
  const rx = AO.getPrescriptionsForPatient(session.patientId);
  const timeline = AO.getTimelineForPatient(session.patientId);
  const device = AO.getDeviceForPatient(session.patientId);

  const greetEl = document.getElementById("dash-greeting");
  if(greetEl) greetEl.textContent = `Welcome back, ${session.name.split(" ")[0]}`;

  const statsEl = document.getElementById("dash-stats");
  if(statsEl){
    statsEl.innerHTML = `
      <div class="card stat-card"><div class="stat-value">${appts.length}</div><div class="stat-label">Upcoming appointments</div></div>
      <div class="card stat-card"><div class="stat-value">${rx.length}</div><div class="stat-label">Treatment plans</div></div>
      <div class="card stat-card"><div class="stat-value">${timeline.length}</div><div class="stat-label">Timeline events</div></div>
      <div class="card stat-card"><div class="stat-value">${device ? (device.status === 'online' ? 'Online' : 'Offline') : '—'}</div><div class="stat-label">Care Assistant device</div></div>
    `;
  }

  const apptEl = document.getElementById("dash-next-appt");
  if(apptEl){
    if(appts.length){
      const a = appts[0];
      apptEl.innerHTML = `
        <div class="list-row">
          <div class="avatar" style="background:var(--accent)">${AoIcon.calendar}</div>
          <div>
            <div class="row-title">${a.type} with ${AO.getDoctor(a.doctorId).name}</div>
            <div class="row-sub">${aoFormatDate(a.date)} · ${a.time}</div>
          </div>
        </div>`;
    } else {
      apptEl.innerHTML = aoEmptyState("No upcoming appointments yet.");
    }
  }

  const timelineEl = document.getElementById("dash-timeline-preview");
  if(timelineEl){
    const recent = timeline.slice(-3).reverse();
    timelineEl.innerHTML = recent.length ? `<div class="timeline">${recent.map(t => `
        <div class="timeline-item">
          <div class="t-date">${aoFormatDate(t.date)}</div>
          <div class="t-title">${t.title}</div>
          <div class="t-desc">${t.desc}</div>
        </div>`).join("")}</div>` : aoEmptyState("Your health journey will appear here.");
  }

  aoRenderModeSwitcher("mode-switcher-container");

  const junior = document.getElementById("junior-buddy");
  if(junior) junior.style.display = session.mode === "junior" ? "flex" : "none";

  aoInitOrbitWidget("dashboard");
}

/* ---------------- Help / Emergency ---------------- */
function aoTriggerHelp(){
  aoOpenModal(`
    <h3>Need help right now?</h3>
    <p>This is a simulated help action for the hackathon prototype. In a real deployment, this would alert hospital staff immediately.</p>
    <div class="card-flat" style="margin-bottom:16px;">
      <strong>Hospital emergency contact (demo):</strong><br/>
      +91 1800-DEMO-CARE
    </div>
    <p class="text-muted" style="font-size:.85rem;">If this is a life-threatening emergency, please call your local emergency number directly.</p>
    <div class="flex gap-3">
      <button class="btn btn-primary btn-block" id="help-confirm">Notify hospital staff (simulated)</button>
      <button class="btn btn-secondary" id="help-cancel">Close</button>
    </div>
  `);
  document.getElementById("help-cancel").addEventListener("click", aoCloseModal);
  document.getElementById("help-confirm").addEventListener("click", () => {
    const session = AoSession.get();
    AO.log(session.name, "Triggered help/emergency alert (simulated)", "Hospital staff");
    aoCloseModal();
    aoToast("Hospital staff notified (simulated for demo).", "success");
  });
}
