"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const branches = [
  { code: "CSA", name: "Computer Science & Application", icon: "💻", color: "#6c63ff" },
  { code: "ABM", name: "Agri-Business Management", icon: "🌾", color: "#10b981" },
  { code: "Bio Informatics", name: "Bio Informatics", icon: "📊", color: "#f59e0b" },
];

export default function HomePage() {
  const [content, setContent] = useState({
      hero: { title: "Your CPGS Hub", subtitle: "One stop for syllabi, exam schedules, PYQs, routines, and an AI-powered academic assistant. Built by students, for students." },
      features: [
        { icon: "📚", title: "Browse Resources", desc: "Access syllabi, PYQs, and notes organized by branch & semester.", href: "/browse", color: "#6c63ff" },
        { icon: "📅", title: "Class Routine", desc: "View your complete weekly class schedule at a glance.", href: "/routine", color: "#10b981" },
        { icon: "📝", title: "Exam Schedule", desc: "Never miss an exam — see all upcoming dates in one place.", href: "/exams", color: "#f59e0b" },
        { icon: "☁️", title: "Upload & Share", desc: "Contribute notes and PYQs to help your fellow students.", href: "/upload", color: "#ec4899" },
        { icon: "🤖", title: "AI Assistant", desc: "Ask questions about routines, exams, and syllabus content. Powered by Gemini.", href: "#", color: "#a78bfa" },
        { icon: "➕", title: "Add Routine", desc: "Add your section's class schedule for others to see.", href: "/add-routine", color: "#3b82f6" },
      ]
  });

  const [adminMessage, setAdminMessage] = useState<any>(null);

  useEffect(() => {
      // Fetch Home Content
      fetch("/api/admin/config?key=home_content")
        .then(res => res.json())
        .then(data => {
            if (data.value) {
                const parsed = JSON.parse(data.value);
                setContent(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ...parsed.hero }
                    // Features can be dynamic too but requires complex UI, skipping for now as per plan
                }));
            }
        });

      // Fetch Admin Message
      fetch("/api/admin/config?key=admin_message")
        .then(res => res.json())
        .then(data => {
            if (data.value) {
                const parsed = JSON.parse(data.value);
                if (parsed.text) setAdminMessage(parsed);
            }
        });
  }, []);

  return (
    <div>
      {/* Hero with gradient background */}
      <section className="hero-bg" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className="animate-in" style={{ animationDelay: "0.1s" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              {content.hero.title}
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
              {content.hero.subtitle}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/browse" className="btn-primary" style={{ textDecoration: "none", padding: "14px 32px", fontSize: 16 }}>📚 Browse Resources</Link>
              <Link href="/upload" className="btn-ghost" style={{ textDecoration: "none", padding: "14px 32px", fontSize: 16 }}>☁️ Upload Now</Link>
            </div>
          </div>
        </div>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
      </section>

      {/* Admin Message Section */}
      {adminMessage && (
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
            <div className="glass-card animate-in" style={{ padding: 24, borderLeft: "4px solid var(--accent)", background: "rgba(108, 99, 255, 0.05)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    📢 Update from Admin
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{adminMessage.text}</p>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                    — Posted by {adminMessage.authorName} ({adminMessage.authorRole}) • {new Date(adminMessage.updatedAt).toLocaleDateString()}
                </div>
            </div>
          </section>
      )}

      {/* Branches */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
        <h2 className="animate-in" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "var(--foreground)" }}>
          🏛️ <span className="gradient-text">Explore by Branch</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {branches.map((b, i) => (
            <Link key={b.code} href={`/browse?branch=${b.code}`} className="glass-card animate-in" style={{ padding: 28, textDecoration: "none", color: "inherit", animationDelay: `${0.2 + i * 0.1}s`, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${b.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                {b.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>{b.code}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{b.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
        <h2 className="animate-in" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "var(--foreground)", animationDelay: "0.3s" }}>
          ✨ <span className="gradient-text">Features</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {content.features.map((f, i) => (
            <Link key={f.title} href={f.href} className="glass-card animate-in" style={{ padding: 24, textDecoration: "none", color: "inherit", animationDelay: `${0.35 + i * 0.08}s` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: "var(--foreground)" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div className="glass-card animate-in" style={{ padding: "40px 32px", textAlign: "center", animationDelay: "0.6s", background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(167,139,250,0.05))" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "var(--foreground)" }}>Community Driven 🌟</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Students upload and share resources. Admins verify quality. Everyone benefits.
          </p>
        </div>
      </section>
    </div>
  );
}
