"use client";

import { useState, useEffect } from "react";
import { getPendingResources, getResources, approveResource, deleteResource } from "@/actions/resources";
import { getExams, deleteExam } from "@/actions/exams";
import { getAllRoutines, deleteRoutine } from "@/actions/routines";

// --- Theme Presets ---
const THEME_PRESETS: Record<string, { label: string; colors: Record<string, string> }> = {
  default: {
    label: "🌌 Nebula (Default)",
    colors: {} // Reset to CSS defaults
  },
  vercel: {
    label: "▲ Vercel (Dark)",
    colors: {
      "--background": "#000000",
      "--foreground": "#ffffff",
      "--card-bg": "rgba(10, 10, 10, 0.8)",
      "--card-border": "#333333",
      "--accent": "#ffffff",
      "--accent-light": "#ededed",
      "--accent-glow": "rgba(255, 255, 255, 0.15)",
      "--surface-1": "#111111",
      "--surface-2": "#222222",
      "--text-muted": "#888888",
      "--nav-bg": "rgba(0, 0, 0, 0.8)",
      "--hero-glow-1": "transparent",
      "--hero-glow-2": "transparent",
      "--hero-glow-3": "transparent"
    }
  },
  twitter: {
    label: "🐦 Twitter (Dim)",
    colors: {
        "--background": "#15202b",
        "--foreground": "#ffffff",
        "--card-bg": "rgba(25, 39, 52, 0.8)",
        "--card-border": "#38444d",
        "--accent": "#1d9bf0",
        "--accent-light": "#8ecdf8",
        "--accent-glow": "rgba(29, 155, 240, 0.3)",
        "--surface-1": "#192734",
        "--surface-2": "#22303c",
        "--text-muted": "#8899a6",
        "--nav-bg": "rgba(21, 32, 43, 0.9)",
        "--hero-glow-1": "rgba(29, 155, 240, 0.1)",
        "--hero-glow-2": "transparent",
        "--hero-glow-3": "transparent"
    }
  },
  nature: {
    label: "🌿 Nature (Green)",
    colors: {
        "--background": "#051a10",
        "--foreground": "#e0f2e9",
        "--card-bg": "rgba(10, 40, 25, 0.8)",
        "--card-border": "rgba(40, 167, 69, 0.3)",
        "--accent": "#28a745",
        "--accent-light": "#5ddc79",
        "--accent-glow": "rgba(40, 167, 69, 0.4)",
        "--surface-1": "#0b2618",
        "--surface-2": "#143d26",
        "--text-muted": "#82a090",
        "--nav-bg": "rgba(5, 26, 16, 0.85)",
        "--hero-glow-1": "rgba(40, 167, 69, 0.2)",
        "--hero-glow-2": "rgba(93, 220, 121, 0.1)",
        "--hero-glow-3": "rgba(20, 80, 50, 0.3)"
    }
  },
  orange: {
    label: "🍊 Sunset (Orange)",
    colors: {
        "--background": "#1a0f0a",
        "--foreground": "#ffe8e0",
        "--card-bg": "rgba(40, 20, 10, 0.8)",
        "--card-border": "rgba(255, 100, 0, 0.3)",
        "--accent": "#ff6b00",
        "--accent-light": "#ff9e4d",
        "--accent-glow": "rgba(255, 107, 0, 0.4)",
        "--surface-1": "#2b160c",
        "--surface-2": "#3d2012",
        "--text-muted": "#a08070",
        "--nav-bg": "rgba(26, 15, 10, 0.85)",
        "--hero-glow-1": "rgba(255, 107, 0, 0.2)",
        "--hero-glow-2": "rgba(255, 60, 0, 0.1)",
        "--hero-glow-3": "rgba(255, 160, 0, 0.1)"
    }
  },
  purple: {
      label: "🔮 Amethyst (Purple)",
      colors: {
          "--background": "#120a21",
          "--foreground": "#eaddff",
          "--card-bg": "rgba(35, 20, 60, 0.8)",
          "--card-border": "rgba(140, 80, 255, 0.3)",
          "--accent": "#9d4edd",
          "--accent-light": "#ccc2ff",
          "--accent-glow": "rgba(157, 78, 221, 0.4)",
          "--surface-1": "#1f1136",
          "--surface-2": "#2e1a50",
          "--text-muted": "#9d8caf",
          "--nav-bg": "rgba(18, 10, 33, 0.85)",
          "--hero-glow-1": "rgba(157, 78, 221, 0.25)",
          "--hero-glow-2": "rgba(100, 50, 200, 0.15)",
          "--hero-glow-3": "rgba(200, 100, 255, 0.1)"
      }
  },
  crimson: {
      label: "🔴 Crimson (Red)",
      colors: {
          "--background": "#1a0505",
          "--foreground": "#ffe0e0",
          "--card-bg": "rgba(40, 10, 10, 0.8)",
          "--card-border": "rgba(220, 38, 38, 0.3)",
          "--accent": "#dc2626",
          "--accent-light": "#ff6b6b",
          "--accent-glow": "rgba(220, 38, 38, 0.4)",
          "--surface-1": "#2b0a0a",
          "--surface-2": "#3d1010",
          "--text-muted": "#bc8c8c",
          "--nav-bg": "rgba(26, 5, 5, 0.85)",
          "--hero-glow-1": "rgba(220, 38, 38, 0.25)",
          "--hero-glow-2": "rgba(255, 80, 80, 0.15)",
          "--hero-glow-3": "rgba(180, 20, 20, 0.1)"
      }
  },
  cyber: {
      label: "⚡ Cyber (Teal)",
      colors: {
          "--background": "#021214",
          "--foreground": "#e0faff",
          "--card-bg": "rgba(5, 35, 40, 0.8)",
          "--card-border": "rgba(6, 182, 212, 0.3)",
          "--accent": "#06b6d4",
          "--accent-light": "#67e8f9",
          "--accent-glow": "rgba(6, 182, 212, 0.45)",
          "--surface-1": "#082024",
          "--surface-2": "#0e2e33",
          "--text-muted": "#709096",
          "--nav-bg": "rgba(2, 18, 20, 0.85)",
          "--hero-glow-1": "rgba(6, 182, 212, 0.25)",
          "--hero-glow-2": "rgba(34, 211, 238, 0.15)",
          "--hero-glow-3": "rgba(8, 145, 178, 0.1)"
      }
  },
  coffee: {
      label: "☕ Coffee (Sepia)",
      colors: {
          "--background": "#1c1917",
          "--foreground": "#e7e5e4",
          "--card-bg": "rgba(35, 30, 28, 0.8)",
          "--card-border": "rgba(168, 162, 158, 0.2)",
          "--accent": "#d6d3d1",
          "--accent-light": "#f5f5f4",
          "--accent-glow": "rgba(214, 211, 209, 0.2)",
          "--surface-1": "#292524",
          "--surface-2": "#44403c",
          "--text-muted": "#a8a29e",
          "--nav-bg": "rgba(28, 25, 23, 0.85)",
          "--hero-glow-1": "rgba(168, 162, 158, 0.1)",
          "--hero-glow-2": "rgba(120, 113, 108, 0.1)",
          "--hero-glow-3": "rgba(87, 83, 78, 0.1)"
      }
  },
  midnight: {
      label: "🌙 Midnight (Deep Blue)",
      colors: {
          "--background": "#020410",
          "--foreground": "#e0e7ff",
          "--card-bg": "rgba(10, 15, 35, 0.8)",
          "--card-border": "rgba(79, 70, 229, 0.3)",
          "--accent": "#4f46e5",
          "--accent-light": "#818cf8",
          "--accent-glow": "rgba(79, 70, 229, 0.4)",
          "--surface-1": "#0f1629",
          "--surface-2": "#1e293b",
          "--text-muted": "#94a3b8",
          "--nav-bg": "rgba(2, 4, 16, 0.85)",
          "--hero-glow-1": "rgba(79, 70, 229, 0.25)",
          "--hero-glow-2": "rgba(99, 102, 241, 0.15)",
          "--hero-glow-3": "rgba(67, 56, 202, 0.1)"
      }
  }
};

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
    createdBy?: { name: string; role: string } | string;
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
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "announcements" | "exams" | "routines" | "users" | "config" | "theme" | "content">("pending");
  
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
  
  // CMS State
  const [siteIdentity, setSiteIdentity] = useState({ name: "CPGS Hub", logoUrl: "", faviconUrl: "" });
  const [homeContent, setHomeContent] = useState({ 
    hero: { title: "Your CPGS Hub", subtitle: "One stop for syllabi, exam schedules, PYQs, routines, and an AI-powered academic assistant." },
    features: [] as any[] 
  });
  const [adminMessage, setAdminMessage] = useState({ text: "", authorName: "", authorRole: "", updatedAt: "" });

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
        } else if (activeTab === "content") {
            // Fetch all 3 configs
            const keys = ["site_identity", "home_content", "admin_message"];
            for (const key of keys) {
                const res = await fetch(`/api/admin/config?key=${key}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.value) {
                         const parsed = JSON.parse(data.value);
                         if (key === "site_identity") setSiteIdentity(prev => ({ ...prev, ...parsed }));
                         if (key === "home_content") setHomeContent(prev => ({ ...prev, ...parsed }));
                         if (key === "admin_message") setAdminMessage(parsed);
                    }
                }
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

  function applyPreset(key: string) {
      if (key === "default") {
          setThemeConfig({}); // Clear overrides
      } else {
          setThemeConfig(THEME_PRESETS[key].colors);
      }
  }

  async function handleSaveContent(key: string, value: any) {
    setSavingConfig(true);
    try {
        const res = await fetch("/api/admin/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value: JSON.stringify(value) })
        });
        if (res.ok) {
            alert("Content saved!");
            if (key === "admin_message" && value.text === "") {
                 setAdminMessage({ text: "", authorName: "", authorRole: "", updatedAt: "" });
            } else if (key === "admin_message") {
                 // Refresh to get author info
                 fetchData();
            }
        }
        else alert("Failed to save content");
    } catch {
        alert("Error saving content");
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
            { id: "theme", label: "🎨 Interface" },
            { id: "content", label: "✍️ Content"}
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
                                {e.createdBy && typeof e.createdBy === 'object' && (
                                    <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 4 }}>
                                        Added by: {e.createdBy.name} ({e.createdBy.role})
                                    </div>
                                )}
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

                    {themeConfig._metadata && (
                        <div className="glass-card" style={{ marginBottom: 24, padding: "12px 16px", background: "rgba(108, 99, 255, 0.05)", border: "1px solid rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                🎨 Limit updated by <strong>{themeConfig._metadata.updatedBy}</strong> ({themeConfig._metadata.role}) on {new Date(themeConfig._metadata.updatedAt).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Presets Grid */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Presets</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                            {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => applyPreset(key)}
                                    className="glass-card"
                                    style={{
                                        padding: 12,
                                        textAlign: "left",
                                        cursor: "pointer",
                                        border: "1px solid var(--card-border)",
                                        background: "rgba(255,255,255,0.03)",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{preset.label}</div>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        {/* Color Dots */}
                                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: preset.colors["--background"] || "#0a0a1a", border: "1px solid rgba(255,255,255,0.2)" }} />
                                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: preset.colors["--accent"] || "#6c63ff" }} />
                                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: preset.colors["--surface-1"] || "#111128" }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Custom Colors</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
                        {[
                            { label: "Background", key: "--background", def: "#0a0a1a" },
                            { label: "Foreground (Text)", key: "--foreground", def: "#e8e8f0" },
                            { label: "Card Background", key: "--card-bg", def: "rgba(20, 20, 45, 0.8)" },
                            { label: "Card Border", key: "--card-border", def: "rgba(100, 100, 255, 0.15)" },
                            { label: "Accent Color", key: "--accent", def: "#6c63ff" },
                            { label: "Accent Light", key: "--accent-light", def: "#8b83ff" },
                            { label: "Accent Glow", key: "--accent-glow", def: "rgba(108, 99, 255, 0.3)" },
                            { label: "Surface 1", key: "--surface-1", def: "#111128" },
                            { label: "Surface 2", key: "--surface-2", def: "#1a1a3e" },
                            { label: "Text Muted", key: "--text-muted", def: "#9ca3af" },
                            { label: "Navbar BG", key: "--nav-bg", def: "rgba(10, 10, 26, 0.85)" },
                            { label: "Hero Glow 1", key: "--hero-glow-1", def: "rgba(108,99,255,0.18)" },
                            { label: "Hero Glow 2", key: "--hero-glow-2", def: "rgba(167,139,250,0.1)" },
                            { label: "Hero Glow 3", key: "--hero-glow-3", def: "rgba(244,114,182,0.08)" },
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

            {/* CMS Content Tab */}
            {activeTab === "content" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* Branding Section */}
                    <div className="glass-card animate-in" style={{ padding: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700 }}>📢 Branding & Identity</h3>
                            <button onClick={() => handleSaveContent("site_identity", siteIdentity)} disabled={savingConfig} className="btn-primary">Save Branding</button>
                        </div>
                        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                             <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>App Name</label>
                                <input 
                                    type="text" 
                                    value={siteIdentity.name} 
                                    onChange={(e) => setSiteIdentity({...siteIdentity, name: e.target.value})}
                                    className="input-field"
                                />
                             </div>
                             <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Logo URL</label>
                                <input 
                                    type="text" 
                                    value={siteIdentity.logoUrl} 
                                    onChange={(e) => setSiteIdentity({...siteIdentity, logoUrl: e.target.value})}
                                    className="input-field"
                                    placeholder="https://..."
                                />
                             </div>
                             <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Favicon URL</label>
                                <input 
                                    type="text" 
                                    value={siteIdentity.faviconUrl} 
                                    onChange={(e) => setSiteIdentity({...siteIdentity, faviconUrl: e.target.value})}
                                    className="input-field"
                                    placeholder="https://..."
                                />
                             </div>
                        </div>
                    </div>

                    {/* Home Page Content */}
                    <div className="glass-card animate-in" style={{ padding: 24, animationDelay: "0.1s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700 }}>🏠 Home Page Content</h3>
                            <button onClick={() => handleSaveContent("home_content", homeContent)} disabled={savingConfig} className="btn-primary">Save Content</button>
                        </div>
                        <div style={{ display: "grid", gap: 16 }}>
                             <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Hero Title</label>
                                <input 
                                    type="text" 
                                    value={homeContent.hero.title} 
                                    onChange={(e) => setHomeContent({...homeContent, hero: { ...homeContent.hero, title: e.target.value }})}
                                    className="input-field"
                                />
                             </div>
                             <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Hero Subtitle</label>
                                <textarea 
                                    value={homeContent.hero.subtitle} 
                                    onChange={(e) => setHomeContent({...homeContent, hero: { ...homeContent.hero, subtitle: e.target.value }})}
                                    className="input-field"
                                    rows={3}
                                />
                             </div>
                        </div>
                    </div>

                     {/* Admin Message */}
                     <div className="glass-card animate-in" style={{ padding: 24, animationDelay: "0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700 }}>💬 Message from Admin</h3>
                                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>This message will appear prominently on the home page.</p>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleSaveContent("admin_message", { text: "" })} disabled={savingConfig} className="btn-ghost" style={{ color: "#ef4444" }}>Clear Message</button>
                                <button onClick={() => handleSaveContent("admin_message", adminMessage)} disabled={savingConfig} className="btn-primary">Post Message</button>
                            </div>
                        </div>
                        
                        <textarea 
                            value={adminMessage.text} 
                            onChange={(e) => setAdminMessage({...adminMessage, text: e.target.value})}
                            className="input-field"
                            rows={4}
                            placeholder="Write an announcement or welcome message..."
                        />
                        
                        {adminMessage.updatedAt && (
                            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                                Last updated by <strong>{adminMessage.authorName}</strong> ({adminMessage.authorRole}) on {new Date(adminMessage.updatedAt).toLocaleString()}
                            </div>
                        )}
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
