/* =========================================================
   Aarogya Orbit — Health Timeline Logic
   ========================================================= */

function aoRenderTimelinePage(){
  const session = AoSession.requireRole(["patient"]);
  if(!session) return;
  aoApplyStoredMode();
  aoRenderShell("timeline");

  const events = AO.getTimelineForPatient(session.patientId);
  const container = document.getElementById("timeline-container");
  if(!container) return;

  if(!events.length){
    container.innerHTML = aoEmptyState("Your health timeline is empty. Complete a health check to begin your journey.");
    aoInitOrbitWidget("timeline");
    return;
  }

  const byYear = {};
  events.forEach(e => {
    const year = new Date(e.date).getFullYear();
    byYear[year] = byYear[year] || [];
    byYear[year].push(e);
  });

  container.innerHTML = Object.keys(byYear).sort().map(year => `
    <h3 style="margin-top:24px;">${year}</h3>
    <div class="timeline">
      ${byYear[year].map(e => `
        <div class="timeline-item">
          <div class="t-date">${aoFormatDate(e.date)}</div>
          <div class="t-title">${e.title}</div>
          <div class="t-desc">${e.desc}</div>
        </div>
      `).join("")}
    </div>
  `).join("");

  aoInitOrbitWidget("timeline");
}
