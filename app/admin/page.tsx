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
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "announcements" | "exams" | "routines" | "users" | "config" | "theme">("pending");
  
  const [pending, setPending] = useState<PendingResource[]>([]);
  const [approved, setApproved] = useState<PendingResource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [themeConfig, setThemeConfig] = useState<any>({});

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
        } else if (activeTab === "theme") {
            const res = await fetch("/api/admin/config?key=theme_config");
            if (res.ok) {
                const data = await res.json();
                setThemeConfig(data.value ? JSON.parse(data.value) : {});
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

  async function handleSaveTheme() {
    setSavingConfig(true);
    try {
        const res = await fetch("/api/admin/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "theme_config", value: JSON.stringify(themeConfig) })
        });
        if (res.ok) {
            alert("Theme saved! Refresh the page to see changes.");
            window.location.reload();
        }
        else alert("Failed to save theme");
    } catch {
        alert("Error saving theme");
    } finally {
        setSavingConfig(false);
    }
  }

  async function handleResetTheme() {
    if(!confirm("Reset to default theme?")) return;
    setSavingConfig(true);
    try {
        // We can just save an empty object or null, effectively clearing overrides
        // But simpler to just delete? Our API uses POST/upsert. 
        // Let's just save empty object.
        const res = await fetch("/api/admin/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "theme_config", value: "{}" }) // Send empty JSON object
        });
        if (res.ok) {
            alert("Theme reset! Refreshing...");
            window.location.reload();
        } else {
            alert("Failed to reset theme. API Error.");
        }
    } catch {
        alert("Error resetting theme");
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
            { id: "config", label: "🤖 AI Brain" },
            { id: "theme", label: "🎨 Interface" }
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
                    
                    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Edit Prompt</label>
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="input-field"
                                rows={15}
                                style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.5, width: "100%" }}
                                placeholder="You are a helpful assistant..."
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                                <button 
                                    onClick={handleSaveConfig} 
                                    className="btn-primary" 
                                    disabled={savingConfig}
                                >
                                    {savingConfig ? "Saving..." : "Save Configuration"}
                                </button>
                            </div>
                        </div>

                        <div>
                             <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Current Live Prompt</label>
                             <div className="glass-card" style={{ padding: 16, height: "100%", maxHeight: 350, overflowY: "auto", background: "rgba(0,0,0,0.2)", fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap" }}>
                                {aiPrompt || "No prompt set."}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Theme Config Tab */}
            {activeTab === "theme" && (
                <div className="glass-card animate-in" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700 }}>🎨 App Interface & Theme</h3>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Customize the look and feel of the entire application.</p>
                        </div>
                        <button onClick={handleResetTheme} className="btn-ghost" style={{ color: "#ef4444" }}>Reset to Default</button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
                        {[
                            { label: "Background", key: "--background", def: "#0a0a1a" },
                            { label: "Foreground (Text)", key: "--foreground", def: "#e8e8f0" },
                            { label: "Card Background", key: "--card-bg", def: "rgba(20, 20, 45, 0.8)" },
                            { label: "Card Border", key: "--card-border", def: "rgba(100, 100, 255, 0.15)" },
                            { label: "Accent Color", key: "--accent", def: "#6c63ff" },
                            { label: "Accent Light", key: "--accent-light", def: "#8b83ff" },
                            { label: "Surface 1", key: "--surface-1", def: "#111128" },
                            { label: "Surface 2", key: "--surface-2", def: "#1a1a3e" },
                            { label: "Text Muted", key: "--text-muted", def: "#9ca3af" },
                        ].map((item) => (
                            <div key={item.key}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{item.label}</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <input 
                                        type="color" 
                                        value={themeConfig[item.key] || item.def}
                                        onChange={(e) => setThemeConfig({ ...themeConfig, [item.key]: e.target.value })}
                                        style={{ 
                                            width: 40, height: 40, padding: 0, border: "none", 
                                            borderRadius: 8, cursor: "pointer", background: "none" 
                                        }}
                                    />
                                    <input 
                                        type="text" 
                                        value={themeConfig[item.key] || ""}
                                        placeholder={item.def}
                                        onChange={(e) => setThemeConfig({ ...themeConfig, [item.key]: e.target.value })}
                                        className="input-field"
                                        style={{ padding: "8px 12px", fontSize: 13 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
                        <button 
                            onClick={handleSaveTheme} 
                            className="btn-primary" 
                            disabled={savingConfig}
                            style={{ minWidth: 120 }}
                        >
                            {savingConfig ? "Saving..." : "Save Changes"}
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
