import { StudentActivity, StudentPresence, StudentProfile } from "../types";

const SESSION_KEY = "toan_student_session_id";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `stu_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export const telemetryService = {
  getSessionId,
  async heartbeat(profile: StudentProfile, activity: StudentActivity): Promise<void> {
    try {
      await fetch("/api/students/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), ...profile, activity }),
        keepalive: true,
      });
    } catch {
      // Tracking must never prevent the student from learning.
    }
  },
  async getStudents(): Promise<StudentPresence[]> {
    try {
      const res = await fetch(`/api/students/presence?t=${Date.now()}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  },
};
