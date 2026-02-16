"use client";

import { useState, useEffect } from "react";
import { getExams } from "@/actions/exams";

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

interface ExamData {
  _id: string;
  subject: string;
  date: string;
  semester: number;
  type: string;
  time?: string;
  venue?: string;
}

export default function ExamsPage() {
  const [semester, setSemester] = useState<number | "">("");
  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester]);

  async function fetchExams() {
    setLoading(true);
    try {
      const data = await getExams(semester ? Number(semester) : undefined);
      setExams(data);
    } catch { setExams([]); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📝 <span className="gradient-text">Exam Schedule</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Never miss an exam. Filter by semester.</p>
      </div>

      <div className="glass-card animate-in" style={{ padding: 20, marginBottom: 24, animationDelay: "0.1s" }}>
        <select className="input-field" style={{ maxWidth: 280 }} value={semester} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : "")}>
          <option value="">All Semesters</option>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : exams.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {exams.map((exam, i) => (
            <div key={exam._id} className="glass-card animate-in" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", animationDelay: `${0.05 * i}s` }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, background: exam.type === "mid-sem" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {exam.type === "mid-sem" ? "📋" : "📄"}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 4 }}>{exam.subject}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>📅 {new Date(exam.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                  <span style={{ textTransform: "capitalize", padding: "2px 8px", borderRadius: 6, background: exam.type === "mid-sem" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)", fontSize: 12, fontWeight: 600 }}>{exam.type}</span>
                  {exam.time && <span>🕐 {exam.time}</span>}
                  {exam.venue && <span>📍 {exam.venue}</span>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Sem {exam.semester}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <p style={{ fontSize: 16 }}>No exams scheduled {semester ? `for Semester ${semester}` : "yet"}.</p>
        </div>
      )}
    </div>
  );
}
