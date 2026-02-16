"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface IAttachment {
  type: "image" | "pdf";
  url: string;
  name: string;
}

interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  attachments: IAttachment[];
  author: string;
  createdBy?: string;
  createdAt: string;
}

export default function LatestInfoPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const processedAttachments: IAttachment[] = [];
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const base64 = await convertToBase64(file);
          const type = file.type.includes("pdf") ? "pdf" : "image";
          processedAttachments.push({ type, url: base64, name: file.name });
        }
      }

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          attachments: processedAttachments,
          author: user.name,
        }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setFiles(null);
        setShowForm(false);
        fetchAnnouncements();
      } else {
        alert("Failed to post announcement");
      }
    } catch (err) {
      console.error(err);
      alert("Error posting announcement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📢 <span className="gradient-text">Latest Info</span></h1>
          <p style={{ color: "var(--text-muted)" }}>Updates, news, and important notices.</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "Cancel" : "+ Post Update"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card animate-in" style={{ padding: 24, marginBottom: 32, border: "1px solid var(--accent)", background: "var(--surface-1)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>New Announcement</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Title</label>
              <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Exam Schedule Released" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Content</label>
              <textarea className="input-field" value={content} onChange={(e) => setContent(e.target.value)} required rows={4} placeholder="Write your update here..." style={{ resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Attachments (Images/PDFs)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*,application/pdf"
                onChange={(e) => setFiles(e.target.files)}
                className="input-field" 
                style={{ padding: 10 }}
              />
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Supported: JPG, PNG, PDF</p>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : announcements.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {announcements.map((post) => (
            <div key={post._id} className="glass-card animate-in" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>{post.title}</h2>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(post.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                  <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{post.author}</div>
                  {user && (user._id === post.createdBy || user.role === "admin") && (
                    <button 
                        onClick={async () => {
                            if (confirm("Delete this announcement?")) {
                                const res = await fetch(`/api/announcements/${post._id}`, { method: "DELETE" });
                                if (res.ok) fetchAnnouncements();
                                else alert("Failed to delete");
                            }
                        }}
                        className="btn-ghost"
                        style={{ padding: "4px 8px", fontSize: 12, color: "#ef4444", marginTop: 4, cursor: "pointer" }}
                        title="Delete"
                    >
                        🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
              
              <div style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16, fontSize: 15 }}>
                {post.content}
              </div>

              {post.attachments && post.attachments.length > 0 && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16, borderTop: "1px solid var(--card-border)", paddingTop: 16 }}>
                  {post.attachments.map((file, i) => (
                    file.type === "image" ? (
                      <div key={i} style={{ position: "relative", maxWidth: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid var(--card-border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={file.url} alt={file.name} style={{ maxWidth: "100%", maxHeight: 300, display: "block" }} />
                      </div>
                    ) : (
                      <a key={i} href={file.url} download={file.name} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 14, textDecoration: "none", border: "1px solid var(--card-border)" }}>
                        📄 {file.name}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
          <p style={{ fontSize: 16 }}>No announcements yet.</p>
        </div>
      )}
    </div>
  );
}
