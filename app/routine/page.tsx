"use client";

import { useState, useEffect } from "react";
import { getRoutine } from "@/actions/routines";
import ScheduleTable from "@/components/ScheduleTable";

const sections = ["CSA-1", "CSA-2", "CSA-3", "ABM-1", "ABM-2", "Bio Informatics-1", "Bio Informatics-2"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

interface ClassItem { time: string; subject: string; room: string; }
interface DaySchedule { day: string; classes: ClassItem[]; }
interface RoutineData { _id: string; section: string; semester: number; schedule: DaySchedule[]; }

export default function RoutinePage() {
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState<number | "">("");
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section && semester) fetchRoutine();
    else setRoutine(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, semester]);

  async function fetchRoutine() {
    setLoading(true);
    try {
      const data = await getRoutine(section, Number(semester));
      setRoutine(data ? data[0] || null : null);
    } catch { setRoutine(null); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📅 <span className="gradient-text">Class Routine</span></h1>
        <p style={{ color: "var(--text-muted)" }}>View your weekly class schedule.</p>
      </div>

      <div className="glass-card animate-in" style={{ padding: 20, marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.1s" }}>
        <select className="input-field" style={{ flex: "1 1 200px" }} value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="">Select Section...</option>
          {sections.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field" style={{ flex: "1 1 200px" }} value={semester} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : "")}>
          <option value="">Select Semester...</option>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>}

      {!loading && routine && (
        <div className="animate-in" style={{ animationDelay: "0.2s" }}>
          <ScheduleTable schedule={routine.schedule} section={routine.section} semester={routine.semester} />
        </div>
      )}

      {!loading && !routine && section && semester && (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p style={{ fontSize: 16 }}>No routine found for {section} Semester {semester}.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            <a href="/add-routine" style={{ color: "var(--accent)" }}>Add one</a> to help others!
          </p>
        </div>
      )}

      {!loading && !section && !semester && (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👆</div>
          <p style={{ fontSize: 16 }}>Select a section and semester to view the routine.</p>
        </div>
      )}
    </div>
  );
}
