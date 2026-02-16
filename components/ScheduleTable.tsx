interface ClassItem {
  time: string;
  subject: string;
  room: string;
}

interface ScheduleDay {
  day: string;
  classes: ClassItem[];
}

interface ScheduleTableProps {
  schedule: ScheduleDay[];
  section: string;
  semester: number;
}

const dayColors: Record<string, string> = {
  Monday: "#6c63ff",
  Tuesday: "#10b981",
  Wednesday: "#f59e0b",
  Thursday: "#ec4899",
  Friday: "#3b82f6",
  Saturday: "#a78bfa",
};

export default function ScheduleTable({
  schedule,
  section,
  semester,
}: ScheduleTableProps) {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg, rgba(108, 99, 255, 0.12), rgba(167, 139, 250, 0.08))",
          borderBottom: "1px solid rgba(100, 100, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 22 }}>📅</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#e8e8f0" }}>
            {section}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Semester {semester}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {schedule.map((day) => {
          const color = dayColors[day.day] || "#6c63ff";
          return (
            <div key={day.day}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: color,
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: color,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {day.day}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 8,
                  paddingLeft: 12,
                }}
              >
                {day.classes.map((cls, j) => (
                  <div
                    key={j}
                    style={{
                      background: "rgba(20, 20, 45, 0.6)",
                      border: `1px solid ${color}22`,
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#e8e8f0",
                        marginBottom: 4,
                      }}
                    >
                      {cls.subject}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>🕐 {cls.time}</span>
                      <span>🏠 {cls.room}</span>
                    </div>
                  </div>
                ))}
                {day.classes.length === 0 && (
                  <div style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>
                    No classes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
