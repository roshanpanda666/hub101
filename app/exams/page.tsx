"use client";

import { useState, useEffect } from "react";
import { getExams, createExam, deleteExam } from "@/actions/exams"; // Updated import
import { useAuth } from "@/context/AuthContext";

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const branches = ["CSA", "ABM", "Bio Informatics"];

// 1. Interfaces
interface ExamData {
  _id: string;
  subject: string;
  date: string;
  semester: number;
  type: string;
  branch: string;
  time?: string;
  venue?: string;
  isNotice?: boolean;
  imageUrl?: string;
  createdBy?: string;
}

export default function ExamsPage() {
  const { user } = useAuth();
  const [semester, setSemester] = useState<number | "">("");
  const [branch, setBranch] = useState("");
  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [uploadMode, setUploadMode] = useState<"manual" | "notice">("manual");
  const [newSubject, setNewSubject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState("Mid-Sem");
  const [newSemester, setNewSemester] = useState("1");
  const [newBranch, setNewBranch] = useState("CSA");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [noticeFile, setNoticeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester, branch]);

  async function fetchExams() {
    setLoading(true);
    try {
      const data = await getExams(semester ? Number(semester) : undefined, branch || undefined);
      setExams(data);
    } catch { setExams([]); }
    finally { setLoading(false); }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  async function handleAddExam(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (uploadMode === "notice" && noticeFile) {
        imageUrl = await convertToBase64(noticeFile);
      }

      await createExam({
        subject: uploadMode === "notice" ? (newSubject || "Exam Notice") : newSubject,
        date: newDate, // Required by DB validation even for notices? Yes.
        type: newType as "Mid-Sem" | "End-Sem",
        semester: Number(newSemester),
        branch: newBranch,
        time: newTime,
        venue: newVenue,
        isNotice: uploadMode === "notice",
        imageUrl,
      });

      setShowAddForm(false);
      fetchExams();
      // Reset form
      setNewSubject("");
      setNewDate("");
      setNewTime("");
      setNewVenue("");
      setNoticeFile(null);
    } catch (error) {
      console.error(error);
      alert("Failed to add exam");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📝 <span className="gradient-text">Exam Schedule</span></h1>
          <p style={{ color: "var(--text-muted)" }}>Never miss an exam. Filter by branch & semester.</p>
        </div>
        {user && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ fontSize: 14, padding: "10px 20px" }}>
                {showAddForm ? "Cancel" : "+ Add Exam"}
            </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card animate-in" style={{ padding: 20, marginBottom: 24, animationDelay: "0.1s", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <select className="input-field" style={{ flex: "1 1 200px" }} value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="input-field" style={{ flex: "1 1 200px" }} value={semester} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : "")}>
          <option value="">All Semesters</option>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddExam} className="glass-card animate-in" style={{ padding: 24, marginBottom: 32, border: "1px solid var(--accent)", background: "var(--surface-1)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add New Exam</h3>

            {/* Upload Mode Toggle */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <button 
                    type="button" 
                    onClick={() => {
                        setUploadMode("manual");
                        setNoticeFile(null); // Clear file when switching
                    }} 
                    className={uploadMode === "manual" ? "btn-primary" : "btn-ghost"}
                    style={{ fontSize: 13, padding: "6px 12px" }}
                >
                    ✍️ Manual Entry
                </button>
                <button 
                    type="button" 
                    onClick={() => setUploadMode("notice")} 
                    className={uploadMode === "notice" ? "btn-primary" : "btn-ghost"}
                    style={{ fontSize: 13, padding: "6px 12px" }}
                >
                    🖼️ Upload Photo
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Branch</label>
                    <select className="input-field" value={newBranch} onChange={e => setNewBranch(e.target.value)} required>
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Semester</label>
                    <select className="input-field" value={newSemester} onChange={e => setNewSemester(e.target.value)} required>
                        {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Date</label>
                    <input type="date" className="input-field" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                </div>
                 <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Type</label>
                    <select className="input-field" value={newType} onChange={e => setNewType(e.target.value)}>
                        <option value="Mid-Sem">Mid-Sem</option>
                        <option value="End-Sem">End-Sem</option>
                    </select>
                </div>
                
                {uploadMode === "manual" ? (
                    <>
                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Subject</label>
                            <input className="input-field" value={newSubject} onChange={e => setNewSubject(e.target.value)} required placeholder="e.g. Data Structures" />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Time</label>
                            <input className="input-field" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="e.g. 10:00 AM" />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Venue</label>
                            <input className="input-field" value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="e.g. Room 304" />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Title (Optional)</label>
                            <input className="input-field" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Full Routine" />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Notice Photo (Max 5MB)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                            alert("File is too large. Max 5MB.");
                                            e.target.value = ""; // Clear input
                                            setNoticeFile(null);
                                        } else {
                                            setNoticeFile(file);
                                        }
                                    } else {
                                        setNoticeFile(null);
                                    }
                                }}
                                className="input-field" 
                                style={{ padding: 10 }}
                                required
                            />
                        </div>
                    </>
                )}
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save Exam"}
            </button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : exams.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {exams.map((exam, i) => (
            <div key={exam._id} className="glass-card animate-in" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", animationDelay: `${0.05 * i}s` }}>
              
              {exam.isNotice && exam.imageUrl ? (
                  // Notice View
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>{exam.subject || "Exam Notice"}</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                                <span>📅 {new Date(exam.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span> • 
                                <span style={{ marginLeft: 6 }}>{exam.branch}</span> • 
                                <span style={{ marginLeft: 6 }}>Sem {exam.semester}</span>
                            </div>
                        </div>
                         {user && (
                            <button 
                                onClick={async () => {
                                    if (confirm("Delete this notice?")) {
                                        await deleteExam(exam._id);
                                        fetchExams();
                                    }
                                }} 
                                className="btn-ghost" 
                                style={{ padding: "4px 8px", fontSize: 12, color: "#ef4444" }}
                                title="Delete Notice"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={exam.imageUrl} alt="Notice" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--card-border)" }} />
                  </div>
              ) : (
                  // Manual Entry View
                  <>
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: exam.type === "mid-sem" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {exam.type === "Mid-Sem" ? "📋" : "📄"} 
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 4 }}>{exam.subject}</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span>📅 {new Date(exam.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                        <span style={{ textTransform: "capitalize", padding: "2px 8px", borderRadius: 6, background: exam.type === "mid-sem" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)", fontSize: 12, fontWeight: 600 }}>{exam.type}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(108,99,255,0.12)", color: "var(--accent-light)", fontSize: 12, fontWeight: 600 }}>{exam.branch}</span>
                        {/* Fix: Display time if it exists */}
                        {exam.time && <span>🕐 {exam.time}</span>}
                        {exam.venue && <span>📍 {exam.venue}</span>}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Sem {exam.semester}</div>
                        {user && (user._id === exam.createdBy || user.role === "admin") && (
                            <button 
                                onClick={async () => {
                                    if (confirm("Are you sure you want to delete this exam?")) {
                                        try {
                                            await deleteExam(exam._id);
                                            fetchExams();
                                        } catch (err: any) {
                                            alert(err.message || "Failed to delete");
                                        }
                                    }
                                }} 
                                className="btn-ghost" 
                                style={{ padding: "4px 8px", fontSize: 12, color: "#ef4444" }}
                                title="Delete Exam"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                  </>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <p style={{ fontSize: 16 }}>No exams scheduled.</p>
          {user && <p style={{ fontSize: 14, marginTop: 8 }}>Click "+ Add Exam" to upload one.</p>}
        </div>
      )}
    </div>
  );
}
