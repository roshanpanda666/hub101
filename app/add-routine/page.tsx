"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createRoutine } from "@/actions/routines";
import Link from "next/link";

const sections = ["CSE-1", "CSE-2", "CSE-3", "ABM-1", "ABM-2", "BI-1", "BI-2"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ClassEntry {
  time: string;
  subject: string;
  room: string;
}

interface DaySchedule {
  day: string;
  classes: ClassEntry[];
}

export default function AddRoutinePage() {
  const { user } = useAuth();
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState<number | "">("");
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    days.map((d) => ({ day: d, classes: [] }))
  );
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div className="glass-card animate-in" style={{ padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--foreground)" }}>Sign in to Add Routine</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>You need an account to add routines.</p>
          <Link href="/login" className="btn-primary" style={{ textDecoration: "none", padding: "12px 28px", fontSize: 15 }}>Sign In</Link>
        </div>
      </div>
    );
  }

  function addClass(dayIndex: number) {
    const updated = [...schedule];
    updated[dayIndex].classes.push({ time: "", subject: "", room: "" });
    setSchedule(updated);
  }

  function updateClass(dayIndex: number, classIndex: number, field: keyof ClassEntry, value: string) {
    const updated = [...schedule];
    updated[dayIndex].classes[classIndex][field] = value;
    setSchedule(updated);
  }

  function removeClass(dayIndex: number, classIndex: number) {
    const updated = [...schedule];
    updated[dayIndex].classes.splice(classIndex, 1);
    setSchedule(updated);
  }

  async function handleSubmit() {
    if (!section || !semester) return;
    setStatus("saving");
    try {
      const filteredSchedule = schedule.filter((d) => d.classes.length > 0 && d.classes.some((c) => c.time && c.subject));
      await createRoutine({
        section,
        semester: Number(semester),
        schedule: filteredSchedule.map((d) => ({
          day: d.day,
          classes: d.classes.filter((c) => c.time && c.subject),
        })),
      });
      setStatus("success");
      setSchedule(days.map((d) => ({ day: d, classes: [] })));
      setSection("");
      setSemester("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>➕ <span className="gradient-text">Add Routine</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Add your section&apos;s class schedule for others to view.</p>
      </div>

      <div className="glass-card animate-in" style={{ padding: 32, animationDelay: "0.1s" }}>
        {/* Section & Semester */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <select className="input-field" style={{ flex: "1 1 200px" }} value={section} onChange={(e) => setSection(e.target.value)} required>
            <option value="">Select Section...</option>
            {sections.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field" style={{ flex: "1 1 200px" }} value={semester} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : "")} required>
            <option value="">Select Semester...</option>
            {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>

        {/* Day-wise schedule builder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {schedule.map((day, dayIdx) => (
            <div key={day.day} style={{ background: "var(--surface-1)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{day.day}</span>
                <button type="button" onClick={() => addClass(dayIdx)} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>+ Add Class</button>
              </div>
              {day.classes.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No classes added</p>
              )}
              {day.classes.map((cls, clsIdx) => (
                <div key={clsIdx} style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input className="input-field" style={{ flex: "1 1 120px" }} placeholder="Time (e.g. 10:00)" value={cls.time} onChange={(e) => updateClass(dayIdx, clsIdx, "time", e.target.value)} />
                  <input className="input-field" style={{ flex: "2 1 180px" }} placeholder="Subject" value={cls.subject} onChange={(e) => updateClass(dayIdx, clsIdx, "subject", e.target.value)} />
                  <input className="input-field" style={{ flex: "1 1 100px" }} placeholder="Room" value={cls.room} onChange={(e) => updateClass(dayIdx, clsIdx, "room", e.target.value)} />
                  <button type="button" onClick={() => removeClass(dayIdx, clsIdx)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18 }} title="Remove">✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Uploader info */}
        <div className="glass-card" style={{ padding: 12, marginTop: 20, display: "flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.06)" }}>
          <span>👤</span>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Adding as <strong style={{ color: "var(--accent)" }}>{user.name}</strong></span>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} className="btn-primary" disabled={!section || !semester || status === "saving"} style={{ marginTop: 20, padding: "14px 32px", fontSize: 16, width: "100%", opacity: !section || !semester || status === "saving" ? 0.6 : 1 }}>
          {status === "saving" ? "⏳ Saving..." : "📅 Save Routine"}
        </button>

        {status === "success" && (
          <div style={{ padding: 16, borderRadius: 12, marginTop: 16, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 14, fontWeight: 600 }}>
            ✅ Routine saved successfully!
          </div>
        )}
        {status === "error" && (
          <div style={{ padding: 16, borderRadius: 12, marginTop: 16, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
            ❌ Failed to save routine. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
