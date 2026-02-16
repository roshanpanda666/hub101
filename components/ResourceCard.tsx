interface ResourceCardProps {
  _id: string;
  type: string;
  subject_name: string;
  branch: string;
  semester: number;
  file_name: string;
  uploaded_by?: string;
}

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  syllabus: { icon: "📘", color: "#6c63ff", label: "Syllabus" },
  pyq: { icon: "📄", color: "#f59e0b", label: "PYQ" },
  notes: { icon: "📝", color: "#10b981", label: "Notes" },
};

export default function ResourceCard({
  _id,
  type,
  subject_name,
  branch,
  semester,
  file_name,
  uploaded_by,
}: ResourceCardProps) {
  const config = typeConfig[type] || { icon: "📁", color: "#6c63ff", label: type };

  return (
    <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${config.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {config.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subject_name}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${config.color}20`, color: config.color }}>{config.label}</span>
            <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(108,99,255,0.12)", color: "var(--accent-light)" }}>{branch} · Sem {semester}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 2 }}>
        <span>📎 {file_name}</span>
        {uploaded_by && <span>👤 {uploaded_by}</span>}
      </div>

      <a
        href={`/api/file/${_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
        style={{ fontSize: 13, padding: "10px 20px", textDecoration: "none", textAlign: "center" }}
      >
        📥 Download PDF
      </a>
    </div>
  );
}
