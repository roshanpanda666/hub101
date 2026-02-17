"use client";

import { useState, useEffect } from "react";
import { getPendingResources, getResources, approveResource, deleteResource } from "@/actions/resources";
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
  createdAt?: string;
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
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "announcements" | "exams" | "routines" | "users" | "config">("pending");
  
  const [pending, setPending] = useState<PendingResource[]>([]);
  const [approved, setApproved] = useState<PendingResource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

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
        } else if (activeTab === "approved") {
            const data = await getResources({ approvedOnly: true });
            setApproved(data);
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
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } else if (activeTab === "config") {
            const res = await fetch("/api/admin/config?key=ai_prompt");
            if (res.ok) {
                 const data = await res.json();
                 setAiPrompt(data.value || "");
            }
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

  async function handleDeleteResource(id: string, isPending: boolean) {
    if (!confirm("Delete this upload?")) return;
    await deleteResource(id);
    if (isPending) {
        setPending(prev => prev.filter(r => r._id !== id));
    } else {
        setApproved(prev => prev.filter(r => r._id !== id));
    }
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

  async function handleUpdateUserRole(userId: string, newRole: string) {
      if (!confirm(`Change role to ${newRole}?`)) return;
      const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
          setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
          alert("Failed to update role");
      }
  }

  async function handleDeleteUser(userId: string) {
      if (!confirm("Permanently delete this user?")) return;
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) setUsers(prev => prev.filter(u => u._id !== userId));
      else alert("Failed to delete user");
  }

  async function handleSaveConfig() {
      setSavingConfig(true);
      try {
          const res = await fetch("/api/admin/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: "ai_prompt", value: aiPrompt })
          });
          if (res.ok) alert("System prompt saved!");
          else alert("Failed to save");
      } catch {
          alert("Error saving config");
      } finally {
          setSavingConfig(false);
      }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>⚙️ <span className="gradient-text">Admin Panel</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Full control over content, users, and configuration.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
            { id: "pending", label: "⏳ Pending" },
            { id: "approved", label: "✅ Approved" },
            { id: "announcements", label: "📢 Latest Info" },
            { id: "exams", label: "📝 Exams" },
            { id: "routines", label: "📅 Routines" },
            { id: "users", label: "👥 Users" },
            { id: "config", label: "🤖 AI Brain" }
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
                    fontWeight: 600
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
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{r.subject_name}</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.branch} • Sem {r.semester} • {r.type}</div>
                                <div style={{ fontSize: 12, color: "var(--accent)" }}>👤 {r.uploaded_by || "Unknown"}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <a href={`/api/file/${r._id}`} target="_blank" className="btn-ghost" style={{ padding: "6px 12px" }}>View</a>
                                <button onClick={() => handleApproveResource(r._id)} className="btn-success" style={{ padding: "6px 12px" }}>Approve</button>
                                <button onClick={() => handleDeleteResource(r._id, true)} className="btn-danger" style={{ padding: "6px 12px" }}>Delete</button>
                            </div>
                         </div>
                    </div>
                ))
            )}

            {/* Approved / Past Requests Tab */}
            {activeTab === "approved" && (
                approved.length === 0 ? <EmptyState msg="No approved resources." /> :
                approved.map((r) => (
                    <div key={r._id} className="glass-card animate-in" style={{ padding: 20 }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{r.subject_name}</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.branch} • Sem {r.semester} • {r.type}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Uploaded by: {r.uploaded_by || "Unknown"}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <a href={`/api/file/${r._id}`} target="_blank" className="btn-ghost" style={{ padding: "6px 12px" }}>View</a>
                                <button onClick={() => handleDeleteResource(r._id, false)} className="btn-danger" style={{ padding: "6px 12px" }}>Delete</button>
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
                 users.length === 0 ? <EmptyState msg="No users found." /> :
                 users.map((u) => (
                     <div key={u._id} className="glass-card animate-in" style={{ padding: 20 }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                             <div>
                                 <div style={{ fontWeight: 700 }}>{u.name}</div>
                                 <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{u.email}</div>
                             </div>
                             <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                 <select 
                                     value={u.role} 
                                     onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                     className="input-field" 
                                     style={{ padding: "4px 8px", fontSize: 13 }}
                                 >
                                     <option value="user">User</option>
                                     <option value="cr">CR</option>
                                     <option value="hod">HOD</option>
                                     <option value="developer">Developer</option>
                                     <option value="admin">Admin</option>
                                 </select>
                                 <button onClick={() => handleDeleteUser(u._id)} className="btn-ghost" style={{ padding: "6px 8px", color: "#ef4444" }} title="Delete User">🗑️</button>
                             </div>
                         </div>
                     </div>
                 ))
            )}

            {/* AI Config Tab */}
            {activeTab === "config" && (
                <div className="glass-card animate-in" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🤖 AI System Prompt</h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                        Customize how the AI assistant behaves and what personality it adopts.
                    </p>
                    <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="input-field"
                        rows={10}
                        style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}
                        placeholder="You are a helpful assistant..."
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button 
                            onClick={handleSaveConfig} 
                            className="btn-primary" 
                            disabled={savingConfig}
                        >
                            {savingConfig ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
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
