/* =========================================================
   Aarogya Orbit — Authentication (Demo / Prototype)
   ---------------------------------------------------------
   NOTE: This is a hackathon prototype. Passwords are stored
   in plain demo fixtures for judges' convenience. A real
   deployment must hash passwords server-side (e.g. bcrypt),
   issue signed session tokens, and never authenticate on
   the client. See README.md "Security considerations".
   ========================================================= */

function aoAttemptLogin(email, password, roleHint){
  const db = AO.db();
  const user = db.users.find(u =>
    u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if(!user) return { ok:false, reason:"Invalid email or password." };
  if(roleHint && user.role !== roleHint) return { ok:false, reason:`This account is not registered as a ${roleHint}.` };

  const session = {
    userId: user.id, role: user.role, name: user.name, email: user.email
  };
  if(user.role === "patient"){
    const patient = AO.getPatient(user.patientId);
    session.patientId = user.patientId;
    session.avatarColor = patient ? patient.avatarColor : "#4A5CE0";
    session.mode = patient ? patient.mode : "classic";
  }
  if(user.role === "doctor"){
    session.doctorId = user.doctorId;
    session.avatarColor = "#227A5B";
  }
  if(user.role === "admin"){
    session.avatarColor = "#C8862A";
  }

  AoSession.set(session);
  AO.log(user.name, "Logged in", user.role);
  return { ok:true, session };
}

function aoRouteAfterLogin(session){
  if(session.role === "patient") window.location.href = "patient-dashboard.html";
  else if(session.role === "doctor") window.location.href = "doctor-dashboard.html";
  else if(session.role === "admin") window.location.href = "admin-dashboard.html";
}

function aoSetPatientMode(mode){
  const session = AoSession.get();
  if(!session || session.role !== "patient") return;
  session.mode = mode;
  AoSession.set(session);
  const db = AO.db();
  const patient = db.patients.find(p => p.id === session.patientId);
  if(patient){ patient.mode = mode; AO.save(db); }
}
