/* =========================================================
   Aarogya Orbit — Shared App Utilities
   (session, sidebar, toasts, modal, ORBIT floating widget)
   ========================================================= */

const AO_SESSION_KEY = "AO_SESSION_v1";

const AoSession = {
  get(){
    try{ return JSON.parse(localStorage.getItem(AO_SESSION_KEY)); }catch(e){ return null; }
  },
  set(session){ localStorage.setItem(AO_SESSION_KEY, JSON.stringify(session)); },
  clear(){ localStorage.removeItem(AO_SESSION_KEY); },
  requireRole(roles){
    const s = this.get();
    if(!s || !roles.includes(s.role)){
      window.location.href = "index.html";
      return null;
    }
    return s;
  }
};

/* ---------------- Toasts ---------------- */
function aoEnsureToastRegion(){
  let region = document.getElementById("ao-toast-region");
  if(!region){
    region = document.createElement("div");
    region.id = "ao-toast-region";
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  return region;
}
function aoToast(message, type){
  const region = aoEnsureToastRegion();
  const el = document.createElement("div");
  el.className = "ao-toast" + (type ? " " + type : "");
  el.textContent = message;
  region.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

/* ---------------- Modal ---------------- */
function aoOpenModal(innerHTML){
  aoCloseModal();
  const backdrop = document.createElement("div");
  backdrop.className = "ao-modal-backdrop";
  backdrop.id = "ao-active-modal";
  backdrop.innerHTML = `<div class="ao-modal" role="dialog" aria-modal="true">${innerHTML}</div>`;
  backdrop.addEventListener("click", (e) => { if(e.target === backdrop) aoCloseModal(); });
  document.body.appendChild(backdrop);
}
function aoCloseModal(){
  const existing = document.getElementById("ao-active-modal");
  if(existing) existing.remove();
}

/* ---------------- Icons (inline SVG, no external deps) ---------------- */
const AoIcon = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 1 1-3-6.2"/><path d="M21 3l-6 6-3-3"/></svg>`,
  timeline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v8"/><path d="M6 12h9a3 3 0 0 0 3-3V6"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>`,
  pill: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="7" rx="3.5" transform="rotate(-20 12 13)"/><path d="M9 9l6 8"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M2 21c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="8" r="2.5"/><path d="M17 15c2.8.3 5 2 5 6"/></svg>`,
  device: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6z"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06A2 2 0 1 1 7.03 4.2l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  orbit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="4.2" ry="10" transform="rotate(45 12 12)"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.3 1-1.3 2"/><path d="M12 17h.01"/></svg>`,
  reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 13h8M8 17h5"/></svg>`,
};

/* ---------------- Sidebar ---------------- */
const AO_NAV = {
  patient: [
    { key: "dashboard", label: "Dashboard", href: "patient-dashboard.html", icon: AoIcon.home },
    { key: "case-taking", label: "Health Check", href: "case-taking.html", icon: AoIcon.chat },
    { key: "timeline", label: "Health Timeline", href: "timeline.html", icon: AoIcon.timeline },
    { key: "appointments", label: "Appointments", href: "appointments.html", icon: AoIcon.calendar },
    { key: "prescriptions", label: "Treatment", href: "prescriptions.html", icon: AoIcon.pill },
    { key: "reports", label: "Reports", href: "reports.html", icon: AoIcon.reports },
    { key: "consent", label: "Consent & Privacy", href: "consent.html", icon: AoIcon.shield },
    { key: "settings", label: "Settings", href: "settings.html", icon: AoIcon.gear },
  ],
  doctor: [
    { key: "dashboard", label: "Dashboard", href: "doctor-dashboard.html", icon: AoIcon.home },
    { key: "settings", label: "Settings", href: "settings.html", icon: AoIcon.gear },
  ],
  admin: [
    { key: "dashboard", label: "Admin Dashboard", href: "admin-dashboard.html", icon: AoIcon.home },
    { key: "device", label: "Device Status", href: "device.html", icon: AoIcon.device },
    { key: "settings", label: "Settings", href: "settings.html", icon: AoIcon.gear },
  ]
};

function aoRenderShell(activeKey){
  const session = AoSession.get();
  if(!session) return;
  const nav = AO_NAV[session.role] || [];
  const navHtml = nav.map(item => `
    <a href="${item.href}" class="${item.key === activeKey ? 'active' : ''}">${item.icon}<span>${item.label}</span></a>
  `).join("");
  const mobileNavHtml = nav.map(item => `<a href="${item.href}" class="${item.key === activeKey ? 'active' : ''}">${item.label}</a>`).join("");

  const initials = (session.name || "U").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

  document.querySelectorAll("[data-ao-sidebar]").forEach(el => {
    el.innerHTML = `
      <div class="sidebar-brand">
        <svg class="orbit-mark" viewBox="0 0 24 24" fill="none" stroke="#4A5CE0" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="4.2" ry="10" transform="rotate(45 12 12)"/></svg>
        <div>
          <span class="brand-name">Aarogya Orbit</span>
          <span class="brand-tag">One connected care journey</span>
        </div>
      </div>
      <div class="sidebar-role">${session.role}</div>
      <nav class="nav-list">${navHtml}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar" style="background:${session.avatarColor || '#4A5CE0'}">${initials}</div>
          <div>
            <div class="name">${session.name}</div>
            <div class="role">${session.role}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-block" id="ao-logout-btn" style="justify-content:flex-start;margin-top:6px;">
          ${AoIcon.logout}<span>Log out</span>
        </button>
      </div>
    `;
  });

  document.querySelectorAll("[data-ao-mobile-nav]").forEach(el => {
    el.innerHTML = mobileNavHtml;
    el.classList.add("mobile-nav-strip");
  });

  const logoutBtn = document.getElementById("ao-logout-btn");
  if(logoutBtn) logoutBtn.addEventListener("click", () => {
    AO.log(session.name, "Logged out", "-");
    AoSession.clear();
    window.location.href = "index.html";
  });
}

/* ---------------- Empty state helper ---------------- */
function aoEmptyState(message, icon){
  return `<div class="empty-state">${icon || ""}<p>${message}</p></div>`;
}

/* ---------------- Patient mode application (used across patient pages) ---------------- */
function aoApplyStoredMode(){
  const session = AoSession.get();
  if(session && session.mode){
    document.body.classList.add("mode-" + session.mode);
  }
}

/* ---------------- Date formatting ---------------- */
function aoFormatDate(dateStr){
  const d = new Date(dateStr);
  if(isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

/* ---------------- ORBIT floating widget (all pages) ---------------- */
function aoInitOrbitWidget(pageContext){
  if(document.getElementById("orbit-fab")) return; // already mounted
  const session = AoSession.get();
  if(!session) return;

  const fab = document.createElement("button");
  fab.id = "orbit-fab";
  fab.setAttribute("aria-label", "Open ORBIT assistant");
  fab.innerHTML = AoIcon.orbit;
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.id = "orbit-panel";
  panel.innerHTML = `
    <div class="orbit-header">
      ${AoIcon.orbit}
      <div>
        <div class="orbit-title">ORBIT</div>
        <div class="orbit-sub">Case-taking &amp; navigation assistant</div>
      </div>
    </div>
    <div class="orbit-body" id="orbit-body"></div>
    <div class="orbit-quick-grid">
      <button class="btn btn-secondary btn-sm" data-orbit-action="health-check">Start Health Check</button>
      <button class="btn btn-secondary btn-sm" data-orbit-action="timeline">View Timeline</button>
      <button class="btn btn-secondary btn-sm" data-orbit-action="appointments">Appointments</button>
      <button class="btn btn-secondary btn-sm" data-orbit-action="help">Get Help</button>
    </div>
  `;
  document.body.appendChild(panel);

  fab.addEventListener("click", () => {
    panel.classList.toggle("open");
    if(panel.classList.contains("open")) aoOrbitGreet(pageContext);
  });

  panel.querySelectorAll("[data-orbit-action]").forEach(btn => {
    btn.addEventListener("click", () => aoOrbitQuickAction(btn.dataset.orbitAction));
  });
}

function aoOrbitSay(message){
  const body = document.getElementById("orbit-body");
  if(!body) return;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble ai";
  bubble.style.maxWidth = "92%";
  bubble.textContent = message;
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function aoOrbitGreet(pageContext){
  const body = document.getElementById("orbit-body");
  if(body.dataset.greeted) return;
  body.dataset.greeted = "1";
  const session = AoSession.get();
  let msg = `Hi ${session.name.split(" ")[0]}, I'm ORBIT. `;
  if(pageContext === "appointments"){
    const appt = AO.getAppointmentsForPatient(session.patientId)[0];
    msg += appt ? `Your next appointment is on ${aoFormatDate(appt.date)} at ${appt.time}.` : `You have no upcoming appointments booked.`;
  } else if(pageContext === "timeline"){
    msg += `This is your health journey — every visit, report and treatment in one place.`;
  } else if(pageContext === "dashboard"){
    msg += `I can help you start a health check, check your appointments, or find your reports. What would you like to do?`;
  } else {
    msg += `How can I help you right now?`;
  }
  aoOrbitSay(msg);
}

/* ---------------- 3D tilt interaction (auto-applies everywhere) ---------------- */
const AO_TILT_SELECTOR = ".quick-action, .stat-card, .mode-option, .device-card, .card-hero, .tilt-3d";

function aoBindTilt(el){
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-5px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg)`;
  });
  el.addEventListener("mouseleave", () => { el.style.transform = ""; });
}
function aoRefreshTilt(){
  document.querySelectorAll(AO_TILT_SELECTOR + ":not([data-tilt-bound])").forEach(el => {
    el.setAttribute("data-tilt-bound", "1");
    el.style.transformStyle = "preserve-3d";
    aoBindTilt(el);
  });
}
aoRefreshTilt();
// Let one-shot entrance animations (bounce-in) release the transform property
// once they finish, so hover-tilt can take over cleanly afterwards.
document.addEventListener("animationend", (e) => {
  if(e.target.classList && e.target.classList.contains("bounce-in")) e.target.classList.remove("bounce-in");
});
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  const aoTiltObserver = new MutationObserver(() => aoRefreshTilt());
  if(document.body) aoTiltObserver.observe(document.body, { childList: true, subtree: true });
}

function aoOrbitQuickAction(action){
  const session = AoSession.get();
  if(action === "health-check"){ window.location.href = "case-taking.html"; return; }
  if(action === "timeline"){ window.location.href = "timeline.html"; return; }
  if(action === "appointments"){ window.location.href = "appointments.html"; return; }
  if(action === "help"){
    aoOrbitSay("For urgent concerns, please use the Help button on your dashboard to alert hospital staff. This assistant cannot contact emergency services directly in this prototype.");
    return;
  }
}
