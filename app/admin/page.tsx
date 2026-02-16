"use client";

import { useState, useEffect } from "react";
import { getPendingResources, approveResource, deleteResource } from "@/actions/resources";

interface PendingResource {
  _id: string;
  type: string;
  branch: string;
  semester: number;
  subject_name: string;
  file_name: string;
  uploaded_by?: string;
}

export default function AdminPage() {
  const [resources, setResources] = useState<PendingResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPending(); }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const data = await getPendingResources();
      setResources(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleApprove(id: string) {
    await approveResource(id);
    setResources((prev) => prev.filter((r) => r._id !== id));
  }

  async function handleDelete(id: string) {
    await deleteResource(id);
    setResources((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>⚙️ <span className="gradient-text">Admin Panel</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Review and approve pending uploads.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : resources.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {resources.map((r, i) => (
            <div key={r._id} className="glass-card animate-in" style={{ padding: 20, animationDelay: `${0.05 * i}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 6 }}>{r.subject_name}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(108,99,255,0.15)", color: "var(--accent-light)", textTransform: "capitalize" }}>{r.type}</span>
                    <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981" }}>{r.branch} · Sem {r.semester}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>📎 {r.file_name}</div>
                  {r.uploaded_by && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>👤 {r.uploaded_by}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <a href={`/api/file/${r._id}`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px", textDecoration: "none" }}>👁️ View</a>
                  <button onClick={() => handleApprove(r._id)} className="btn-success" style={{ fontSize: 13, padding: "8px 14px" }}>✅ Approve</button>
                  <button onClick={() => handleDelete(r._id)} className="btn-danger" style={{ fontSize: 13, padding: "8px 14px" }}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p style={{ fontSize: 16 }}>No pending uploads. All caught up!</p>
        </div>
      )}
    </div>
  );
}
