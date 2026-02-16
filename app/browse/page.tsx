"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ResourceCard from "@/components/ResourceCard";
import { getResources } from "@/actions/resources";

const branches = ["CSA", "ABM", "Bio Informatics"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const types = [
  { value: "", label: "All" },
  { value: "syllabus", label: "📘 Syllabus" },
  { value: "pyq", label: "📄 PYQs" },
  { value: "notes", label: "📝 Notes" },
];

interface ResourceItem {
  _id: string;
  type: string;
  branch: string;
  semester: number;
  subject_name: string;
  file_name: string;
  uploaded_by?: string;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialBranch = searchParams.get("branch") || "";

  const [branch, setBranch] = useState(initialBranch);
  const [semester, setSemester] = useState<number | "">("");
  const [type, setType] = useState("");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, semester, type]);

  async function fetchResources() {
    setLoading(true);
    try {
      const filters: { branch?: string; semester?: number; type?: string; approvedOnly?: boolean } = { approvedOnly: true };
      if (branch) filters.branch = branch;
      if (semester) filters.semester = Number(semester);
      if (type) filters.type = type;
      const data = await getResources(filters);
      setResources(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📚 <span className="gradient-text">Browse Resources</span></h1>
        <p style={{ color: "var(--text-muted)" }}>Filter by branch, semester, and type to find what you need.</p>
      </div>

      {/* Branch Cards */}
      {!branch && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          {branches.map((b) => (
            <button key={b} onClick={() => setBranch(b)} className="glass-card" style={{ padding: 20, cursor: "pointer", textAlign: "center", border: "1px solid var(--card-border)", background: "var(--card-bg)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{b === "CSA" ? "💻" : b === "ABM" ? "🌾" : "📊"}</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>{b}</div>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      {branch && (
        <div className="glass-card animate-in" style={{ padding: 20, marginBottom: 32, display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 16 }}>{branch}</span>
            <button onClick={() => setBranch("")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }} title="Clear branch">✕</button>
          </div>

          <select className="input-field" style={{ flex: "1 1 180px" }} value={semester} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : "")}>
            <option value="">All Semesters</option>
            {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: "1 1 300px" }}>
            {types.map((t) => (
              <button key={t.value} onClick={() => setType(t.value)} className={type === t.value ? "btn-primary" : "btn-ghost"} style={{ fontSize: 13, padding: "8px 16px" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : resources.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {resources.map((r, i) => (
            <div key={r._id} className="animate-in" style={{ animationDelay: `${0.05 * i}s` }}>
              <ResourceCard _id={r._id} type={r.type} subject_name={r.subject_name} branch={r.branch} semester={r.semester} file_name={r.file_name} uploaded_by={r.uploaded_by} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 16 }}>No resources found. {branch ? "Try adjusting your filters!" : "Select a branch to get started."}</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
            Or <a href="/upload" style={{ color: "var(--accent)" }}>upload one</a> to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
