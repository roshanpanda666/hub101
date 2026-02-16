import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px" }}>
      <div className="animate-in" style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👨‍💻</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          <span className="gradient-text">About the Developer</span>
        </h1>
      </div>

      <div className="glass-card animate-in" style={{ padding: 40, textAlign: "center", animationDelay: "0.15s" }}>
        {/* Avatar */}
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 42 }}>
          🎓
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--foreground)", marginBottom: 6 }}>
          Sabyasachi Panda
        </h2>
        <p style={{ color: "var(--accent-light)", fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
          Full-Stack Developer · Student · Creator
        </p>

        <p style={{ color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 28px", fontSize: 15 }}>
          Passionate about building tools that make student life easier. 
          CPGS Hub was built to centralize academic resources and 
          bring the power of AI to everyday campus needs.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://connect-card-of-roshan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: "none", padding: "12px 28px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}
          >
            🔗 Connect with Me
          </a>
          <Link href="/" className="btn-ghost" style={{ textDecoration: "none", padding: "12px 28px", fontSize: 15 }}>
            🏠 Back to Home
          </Link>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card animate-in" style={{ padding: 28, marginTop: 24, animationDelay: "0.3s" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--foreground)" }}>
          🛠️ Built With
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {[
            { name: "Next.js", icon: "⚡" },
            { name: "MongoDB", icon: "🍃" },
            { name: "Mongoose", icon: "📦" },
            { name: "Gemini AI", icon: "🤖" },
            { name: "Tailwind CSS", icon: "🎨" },
            { name: "TypeScript", icon: "📘" },
          ].map((tech) => (
            <div key={tech.name} style={{ background: "var(--surface-1)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--foreground)" }}>
              <span>{tech.icon}</span>
              <span style={{ fontWeight: 600 }}>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Open Source */}
      <div className="glass-card animate-in" style={{ padding: 28, marginTop: 24, animationDelay: "0.4s", textAlign: "center" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "var(--foreground)" }}>
          ❤️ Open Source
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          This project is proudly open source! We believe in transparency and collaboration. 
          Feel free to explore the code, report issues, or contribute to making campus life better.
        </p>
        <a 
          href="https://github.com/roshanpanda666/hub101" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ textDecoration: "none", padding: "10px 24px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontSize: 18 }}>🐙</span> Star on GitHub
        </a>
      </div>
    </div>
  );
}
