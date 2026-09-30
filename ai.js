/* =========================================================
   Aarogya Orbit — AI Case-Taking Engine
   ---------------------------------------------------------
   SAFETY CONTRACT (read before editing):
   - This engine NEVER outputs a diagnosis, disease name,
     or medication recommendation.
   - Its only job is: ask structured questions, extract
     structured fields from free text, flag missing fields,
     and produce a doctor-facing SUMMARY (not a diagnosis).
   - Urgent-symptom keywords trigger a generic safety
     message pointing the patient to hospital staff /
     emergency services — never a clinical judgment.

   callAI() below is a clearly separated abstraction layer.
   In this prototype it returns local, rule-based mock
   responses so the app works fully offline / without keys.
   To connect a real provider, replace the body of callAI()
   with a fetch() to your own backend/serverless endpoint
   (never call a provider directly from this frontend, and
   never place AI_API_KEY in client-side code).
   ========================================================= */

const AO_CASE_QUESTIONS = [
  { field: "chiefComplaint", prompt: "What brings you to the clinic today?", type: "text" },
  { field: "duration", prompt: "Since when have you been experiencing this?", type: "text" },
  { field: "location", prompt: "Where exactly are you experiencing the discomfort?", type: "text" },
  { field: "severity", prompt: "On a scale of 1–10, how severe is it?", type: "scale" },
  { field: "aggravating", prompt: "Has anything made it better or worse?", type: "text" },
  { field: "currentMedications", prompt: "Are you currently taking any medication?", type: "text" },
  { field: "allergies", prompt: "Do you have any known allergies?", type: "text" },
  { field: "wellbeing", prompt: "Would you like to mention anything about your recent sleep, food, or lifestyle?", type: "text" }
];

const AO_URGENT_KEYWORDS = [
  "chest pain", "difficulty breathing", "can't breathe", "cannot breathe", "severe bleeding",
  "unconscious", "fainted", "suicidal", "self harm", "seizure", "stroke", "paralysis",
  "severe allergic", "anaphylaxis", "coughing blood", "blue lips", "not breathing"
];

const AO_SAFETY_MESSAGE =
  "These symptoms may require prompt medical evaluation. Please contact hospital staff or emergency services right away. This assistant cannot contact emergency services on its own in this prototype.";

function aoDetectUrgent(text){
  const lower = (text || "").toLowerCase();
  return AO_URGENT_KEYWORDS.some(k => lower.includes(k));
}

/**
 * Very light rule-based "extraction" so the demo can convert
 * free text into structured fields without a real NLP model.
 */
function aoExtractField(field, rawText){
  const text = (rawText || "").trim();
  if(field === "severity"){
    const match = text.match(/\d{1,2}/);
    let n = match ? parseInt(match[0], 10) : null;
    if(n === null){
      if(/mild/i.test(text)) n = 3;
      else if(/moderate/i.test(text)) n = 5;
      else if(/severe|bad|worst/i.test(text)) n = 8;
    }
    return n !== null ? Math.min(Math.max(n,1),10) : text;
  }
  return text;
}

/**
 * Abstraction layer for any external AI provider.
 * Reads AI_MODEL / AI_BASE_URL style config from window.AO_AI_CONFIG
 * (populated from environment variables at build/deploy time in a
 * real deployment — never hardcode secrets here).
 */
async function callAI(task, payload){
  const config = window.AO_AI_CONFIG || { provider: "mock" };

  if(config.provider === "mock" || !config.baseUrl){
    return aoMockAIResponse(task, payload);
  }

  // Real integration path (disabled by default in this prototype):
  // Calls YOUR OWN backend/serverless proxy — never a provider directly.
  try{
    const res = await fetch(config.baseUrl + "/ai/" + task, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error("AI service error: " + res.status);
    return await res.json();
  }catch(err){
    console.error("callAI failed, falling back to mock:", err);
    return aoMockAIResponse(task, payload);
  }
}

function aoMockAIResponse(task, payload){
  if(task === "summarize"){
    return { text: aoBuildSummaryText(payload.caseRecord) };
  }
  return { text: "" };
}

function aoBuildSummaryText(c){
  const lines = [];
  lines.push(`Chief complaint: ${c.chiefComplaint || "Not specified"}.`);
  lines.push(`Duration: ${c.duration || "Not specified"}.`);
  if(c.severity) lines.push(`Patient-reported severity: ${c.severity}/10.`);
  if(c.location) lines.push(`Location: ${c.location}.`);
  if(c.aggravating) lines.push(`Aggravating/relieving factors: ${c.aggravating}.`);
  if(c.currentMedications) lines.push(`Current medications: ${c.currentMedications}.`);
  if(c.allergies) lines.push(`Known allergies: ${c.allergies}.`);
  if(c.wellbeing) lines.push(`Lifestyle / wellbeing notes: ${c.wellbeing}.`);
  lines.push("This is an AI-generated summary of patient-reported information. It is not a diagnosis and must be verified by a doctor before clinical use.");
  return lines.join(" ");
}

function aoMissingFields(caseRecord){
  return AO_CASE_QUESTIONS
    .filter(q => !caseRecord[q.field] && caseRecord[q.field] !== 0)
    .map(q => q.prompt);
}

/* =========================================================
   Case-taking chat driver — powers case-taking.html
   ========================================================= */
const AoChat = {
  qIndex: 0,
  record: {},
  urgentFlagged: false,

  init(){
    this.qIndex = 0;
    this.record = {};
    this.urgentFlagged = false;
    this.renderProgress();
    this.say("Hi, I'm ORBIT. I'll ask a few quick questions to prepare your case for the doctor. I won't diagnose anything — I just organize what you tell me.");
    setTimeout(() => this.askCurrent(), 500);
  },

  say(text, cls){
    const log = document.getElementById("chat-log");
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + (cls || "ai");
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  },
  sayUser(text){ this.say(text, "user"); },

  renderProgress(){
    const total = AO_CASE_QUESTIONS.length;
    const pct = Math.min(100, Math.round((this.qIndex / total) * 100));
    const bar = document.getElementById("chat-progress-fill");
    if(bar) bar.style.width = pct + "%";
    const label = document.getElementById("chat-progress-label");
    if(label) label.textContent = `Step ${Math.min(this.qIndex+1,total)} of ${total}`;
  },

  askCurrent(){
    this.renderProgress();
    if(this.qIndex >= AO_CASE_QUESTIONS.length){
      this.finish();
      return;
    }
    const q = AO_CASE_QUESTIONS[this.qIndex];
    this.say(q.prompt);
    this.renderQuickReplies(q);
  },

  renderQuickReplies(q){
    const wrap = document.getElementById("chat-quick-replies");
    wrap.innerHTML = "";
    if(q.type === "scale"){
      for(let i=1;i<=10;i++){
        const btn = document.createElement("button");
        btn.className = "pill-choice";
        btn.textContent = i;
        btn.addEventListener("click", () => this.submitAnswer(String(i)));
        wrap.appendChild(btn);
      }
    } else if(q.field === "currentMedications" || q.field === "allergies"){
      ["None", "Not sure", "Yes — I'll type it"].forEach(label => {
        const btn = document.createElement("button");
        btn.className = "pill-choice";
        btn.textContent = label;
        btn.addEventListener("click", () => {
          if(label === "Yes — I'll type it"){ document.getElementById("chat-text-input").focus(); return; }
          this.submitAnswer(label);
        });
        wrap.appendChild(btn);
      });
    }
  },

  submitAnswer(raw){
    if(!raw || !raw.trim()) return;
    this.sayUser(raw);
    document.getElementById("chat-quick-replies").innerHTML = "";

    if(aoDetectUrgent(raw)){
      this.urgentFlagged = true;
      this.say(AO_SAFETY_MESSAGE, "system-note");
    }

    const q = AO_CASE_QUESTIONS[this.qIndex];
    this.record[q.field] = aoExtractField(q.field, raw);
    this.qIndex++;

    setTimeout(() => {
      if(this.qIndex < AO_CASE_QUESTIONS.length){
        this.say(this.confirmationPhrase(q, this.record[q.field]));
        setTimeout(() => this.askCurrent(), 500);
      } else {
        this.finish();
      }
    }, 350);
  },

  confirmationPhrase(q, value){
    const phrases = {
      chiefComplaint: `Got it. I've noted: "${value}".`,
      duration: `Thanks — noted as ${value}.`,
      location: `Understood, noted the location.`,
      severity: `Noted severity as ${value}/10.`,
      aggravating: `Thanks, that's helpful context.`,
      currentMedications: `Noted.`,
      allergies: `Thanks, I've recorded that.`,
      wellbeing: `Appreciate you sharing that.`
    };
    return phrases[q.field] || "Got it.";
  },

  async finish(){
    this.renderProgress();
    document.getElementById("chat-progress-label").textContent = "Review your case";
    this.say("Thank you. I've recorded your symptoms. A doctor will evaluate the cause — I can't diagnose anything myself.");
    const missing = aoMissingFields(this.record);
    if(missing.length){
      this.say("A couple of things are still missing, but you can submit now and add them later: " + missing.join("; "), "system-note");
    }
    const result = await callAI("summarize", { caseRecord: this.record });
    this.renderReviewCard(result.text);
  },

  renderReviewCard(summaryText){
    const container = document.getElementById("chat-review");
    container.style.display = "block";
    container.innerHTML = `
      <div class="card">
        <div class="badge badge-warn" style="margin-bottom:10px;">AI-generated summary — verify before clinical use</div>
        <p>${summaryText}</p>
        <div class="flex gap-3">
          <button class="btn btn-primary" id="submit-case-btn">Submit case to doctor</button>
          <button class="btn btn-secondary" id="restart-case-btn">Start over</button>
        </div>
      </div>
    `;
    document.getElementById("submit-case-btn").addEventListener("click", () => this.submitCase(summaryText));
    document.getElementById("restart-case-btn").addEventListener("click", () => {
      document.getElementById("chat-log").innerHTML = "";
      container.style.display = "none";
      this.init();
    });
  },

  submitCase(summaryText){
    const session = AoSession.get();
    const patient = AO.getPatient(session.patientId);
    const db = AO.db();
    const caseId = "cr_" + Date.now();
    const summaryId = "as_" + Date.now();
    db.caseRecords.push({
      id: caseId, patientId: session.patientId, doctorId: patient.assignedDoctor,
      createdAt: new Date().toISOString(), status: this.urgentFlagged ? "urgent-review" : "pending-review",
      chiefComplaint: this.record.chiefComplaint, duration: this.record.duration,
      severity: this.record.severity, location: this.record.location,
      associatedSymptoms: [], aggravating: this.record.aggravating,
      relieving: "", sleep: "", lifestyle: this.record.wellbeing || "",
      currentMedications: this.record.currentMedications || "", allergies: this.record.allergies || "",
      wellbeing: this.record.wellbeing || "", missingInfo: aoMissingFields(this.record),
      aiSummaryId: summaryId
    });
    db.aiSummaries.push({ id: summaryId, caseId, generatedAt: new Date().toISOString(), text: summaryText });
    db.timeline[session.patientId] = db.timeline[session.patientId] || [];
    db.timeline[session.patientId].push({
      date: new Date().toISOString().slice(0,10), title: "Case submitted",
      desc: "Completed case-taking with ORBIT AI: " + (this.record.chiefComplaint || "")
    });
    AO.save(db);
    AO.log(session.name, "Submitted AI-assisted case form", this.record.chiefComplaint || "New case");
    aoToast("Case submitted to your doctor.", "success");
    setTimeout(() => { window.location.href = "patient-dashboard.html"; }, 1200);
  }
};
