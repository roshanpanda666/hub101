"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const branches = ["CSA", "ABM", "Bio Informatics"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const resourceTypes = [
  { value: "syllabus", label: "📘 Syllabus" },
  { value: "pyq", label: "📄 Previous Year Questions" },
  { value: "notes", label: "📝 Notes" },
];

export default function UploadPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div className="glass-card animate-in" style={{ padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--foreground)" }}>Sign in to Upload</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>You need an account to upload resources.</p>
          <Link href="/login" className="btn-primary" style={{ textDecoration: "none", padding: "12px 28px", fontSize: 15 }}>Sign In</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setStatus("uploading");
    setErrorMsg("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File;

    if (!file || !file.name) { setStatus("error"); setErrorMsg("Please select a PDF file."); return; }

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("type", formData.get("type") as string);
      uploadData.append("branch", formData.get("branch") as string);
      uploadData.append("semester", formData.get("semester") as string);
      uploadData.append("subject_name", formData.get("subject_name") as string);
      uploadData.append("uploaded_by", user.name);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Upload failed"); }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>☁️ <span className="gradient-text">Upload Resource</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Share your notes, PYQs, or syllabi. Uploads are reviewed before publishing.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card animate-in" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, animationDelay: "0.1s" }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Resource Type</label>
          <select name="type" className="input-field" required>
            <option value="">Select type...</option>
            {resourceTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Branch</label>
          <select name="branch" className="input-field" required>
            <option value="">Select branch...</option>
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Semester</label>
          <select name="semester" className="input-field" required>
            <option value="">Select semester...</option>
            {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Subject Name</label>
          <input type="text" name="subject_name" className="input-field" placeholder="e.g., Operating Systems" required />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>PDF File</label>
          <input type="file" name="file" accept="application/pdf" className="input-field" style={{ padding: 10 }} required />
        </div>

        <div className="glass-card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.06)" }}>
          <span>👤</span>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Uploading as <strong style={{ color: "var(--accent)" }}>{user.name}</strong></span>
        </div>

        <button type="submit" className="btn-primary" disabled={status === "uploading"} style={{ padding: "14px 32px", fontSize: 16, opacity: status === "uploading" ? 0.6 : 1, cursor: status === "uploading" ? "not-allowed" : "pointer" }}>
          {status === "uploading" ? "⏳ Uploading..." : "🚀 Submit for Review"}
        </button>

        {status === "success" && (
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 14, fontWeight: 600 }}>
            ✅ Upload successful! Your resource is pending admin approval.
          </div>
        )}
        {status === "error" && (
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
            ❌ {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}
