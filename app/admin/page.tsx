"use client";

import { useState, useEffect } from "react";
import { getPendingResources, approveResource, deleteResource } from "@/actions/resources";
import { getExams, deleteExam } from "@/actions/exams";
import { getAllRoutines, deleteRoutine } from "@/actions/routines";

interface PendingResource {
  _id: string;
  type: string;
  branch: string;
  semester: number;
  subject_name: string;
  file_name: string;
  uploaded_by?: string;
}

interface Announcement {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

interface Exam {
    _id: string;
    subject: string;
    date: string;
    semester: number;
    branch: string;
    type: string;
}

interface Routine {
    _id: string;
    semester: number;
    section: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "announcements" | "exams" | "routines" | "users" | "settings">("pending");
  
  const [pending, setPending] = useState<PendingResource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
        if (activeTab === "pending") {
            const data = await getPendingResources();
            setPending(data);
        } else if (activeTab === "announcements") {
            const res = await fetch("/api/announcements");
            if (res.ok) setAnnouncements(await res.json());
        } else if (activeTab === "exams") {
            const data = await getExams();
            setExams(data);
        } else if (activeTab === "routines") {
            const data = await getAllRoutines();
            setRoutines(data);
        } else if (activeTab === "users") {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } else if (activeTab === "settings") {
            const res = await fetch("/api/admin/config?key=ai_prompt");
            const data = await res.json();
            if (data.success && data.value) setAiPrompt(data.value);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  }

  // --- Handlers ---

  async function handleApproveResource(id: string) {
    if (!confirm("Approve this upload?")) return;
    await approveResource(id);
    setPending(prev => prev.filter(r => r._id !== id));
  }

  async function handleDeleteResource(id: string) {
    if (!confirm("Delete this upload?")) return;
    await deleteResource(id);
    setPending(prev => prev.filter(r => r._id !== id));
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) setAnnouncements(prev => prev.filter(a => a._id !== id));
  }

  async function handleDeleteExam(id: string) {
    if (!confirm("Delete this exam?")) return;
    await deleteExam(id);
    setExams(prev => prev.filter(e => e._id !== id));
  }

  async function handleDeleteRoutine(id: string) {
    if (!confirm("Delete this routine?")) return;
    await deleteRoutine(id);
    setRoutines(prev => prev.filter(r => r._id !== id));
  }

  async function handleDeleteUser(id: string) {
      if (!confirm("Are you sure you want to delete this user?")) return;
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u._id !== id));
  }

  async function handleUpdateUserRole(id: string, newRole: string) {
      await fetch(`/api/admin/users`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, role: newRole }),
      });
      fetchData(); // Refresh to ensure sync
  }

  async function handleSaveAiPrompt() {
      await fetch(`/api/admin/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "ai_prompt", value: aiPrompt }),
      });
      alert("AI Prompt updated!");
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>⚙️ <span className="gradient-text">Admin Panel</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Centralized control for all system resources.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
            { id: "pending", label: "⏳ Pending" },
            { id: "announcements", label: "📢 Info" },
            { id: "exams", label: "📝 Exams" },
            { id: "routines", label: "📅 Routines" },
            { id: "users", label: "👥 Users" },
            { id: "settings", label: "🤖 AI Settings" }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`btn-ghost ${activeTab === tab.id ? "active-tab" : ""}`}
                style={{ 
                    padding: "8px 16px", 
                    borderRadius: 8, 
                    background: activeTab === tab.id ? "var(--primary)" : "transparent",
                    color: activeTab === tab.id ? "white" : "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: 14
                }}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            {/* Pending Uploads Tab */}
            {activeTab === "pending" && (
                pending.length === 0 ? <EmptyState msg="No pending uploads." /> :
                pending.map((r) => (
                    <div key={r._id} className="glass-card animate-in" style={{ padding: 20 }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{r.subject_name}</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.branch} • Sem {r.semester} • {r.type}</div>
                                <div style={{ fontSize: 12, color: "var(--accent)" }}>👤 {r.uploaded_by || "Unknown"}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <a href={`/api/file/${r._id}`} target="_blank" className="btn-ghost" style={{ padding: "6px 12px" }}>View</a>
                                <button onClick={() => handleApproveResource(r._id)} className="btn-success" style={{ padding: "6px 12px" }}>Approve</button>
                                <button onClick={() => handleDeleteResource(r._id)} className="btn-danger" style={{ padding: "6px 12px" }}>Delete</button>
                            </div>
                         </div>
                    </div>
                ))
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
                announcements.length === 0 ? <EmptyState msg="No announcements." /> :
                announcements.map((a) => (
                    <div key={a._id} className="glass-card animate-in" style={{ padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{a.title}</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString()} • {a.author}</div>
                            </div>
                            <button onClick={() => handleDeleteAnnouncement(a._id)} className="btn-danger" style={{ padding: "6px 12px" }}>Delete</button>
                        </div>
                    </div>
                ))
            )}

            {/* Exams Tab */}
            {activeTab === "exams" && (
                exams.length === 0 ? <EmptyState msg="No exams scheduled." /> :
                exams.map((e) => (
                    <div key={e._id} className="glass-card animate-in" style={{ padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{e.subject}</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(e.date).toLocaleDateString()} • {e.branch} • Sem {e.semester}</div>
                            </div>
                            <button onClick={() => handleDeleteExam(e._id)} className="btn-danger" style={{ padding: "6px 12px" }}>Delete</button>
                        </div>
                    </div>
                ))
            )}

             {/* Routines Tab */}
             {activeTab === "routines" && (
                routines.length === 0 ? <EmptyState msg="No class routines." /> :
                routines.map((r) => (
                    <div key={r._id} className="glass-card animate-in" style={{ padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>Semester {r.semester} - Section {r.section}</div>
                            </div>
                            <button onClick={() => handleDeleteRoutine(r._id)} className="btn-danger" style={{ padding: "6px 12px" }}>Delete</button>
                        </div>
                    </div>
                ))
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Manage Users</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: 14 }}>
                                    <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                                    <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                                    <th style={{ padding: 12, textAlign: "left" }}>Role</th>
                                    <th style={{ padding: 12, textAlign: "left" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: 12 }}>{u.name}</td>
                                        <td style={{ padding: 12, color: "var(--text-muted)" }}>{u.email}</td>
                                        <td style={{ padding: 12 }}>
                                            <select 
                                                value={u.role} 
                                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                className="input-field"
                                                style={{ padding: "4px 8px", fontSize: 13 }}
                                            >
                                                {["user", "admin", "developer", "cr", "hod"].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <button onClick={() => handleDeleteUser(u._id)} className="btn-ghost" style={{ color: "#ef4444", fontSize: 13 }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* AI Settings Tab */}
            {activeTab === "settings" && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>AI System Prompt</h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>Define how the AI assistant behaves.</p>
                    <textarea 
                        className="input-field" 
                        value={aiPrompt} 
                        onChange={(e) => setAiPrompt(e.target.value)} 
                        rows={10} 
                        style={{ width: "100%", resize: "vertical", fontFamily: "monospace", fontSize: 13 }} 
                    />
                    <button onClick={handleSaveAiPrompt} className="btn-primary" style={{ marginTop: 16 }}>Save Configuration</button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
    return (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <p>{msg}</p>
        </div>
    );
}
